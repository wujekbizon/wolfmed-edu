'use server'

import crypto from 'crypto'
import { auth } from '@clerk/nextjs/server'
import { fromErrorToFormState, toFormState } from '@/helpers/toFormState'
import { checkPremiumAccessAction } from '@/actions/course-actions'
import { FormState } from '@/types/actionTypes'
import { checkRateLimit } from '@/lib/rateLimit'
import { RagQuerySchema } from '@/server/schema'
import { generateGroundedAnswer, executeToolWithContent, answerFromMemory } from '@/server/vertex-rag'
import { retrieveContext } from '@/server/retrieval/context'
import { formatContextChunks } from '@/helpers/formatContextChunks'
import { getNoDataFoundMessage } from '@/helpers/rag-prompts'
import {
  buildStaticPrefix,
  buildMemoryTail,
  isSelfStateQuestion,
  buildSelfStateContext,
} from '@/server/memory/assemble'
import { executeToolLocally } from '@/server/tools/executor'
import { parseMcpCommands } from '@/helpers/parse-mcp-commands'
import { resolveCommandCount } from '@/helpers/resolveCommandCount'
import { extractLeadingCount } from '@/helpers/extractLeadingCount'
import { getNoteById, getAllUserNotes, getMaterialsByUser, getMaterialById } from '@/server/queries'
import type { Resource } from '@/types/resourceTypes'
import { TOOL_DEFINITIONS } from '@/server/tools/definitions'
import { TOOL_COMMANDS, TOOL_COMMAND_NAMES } from '@/constants/toolCommands'
import { createJob, emitProgress, logUser, logTechnical, completeJob, errorJob } from '@/server/progress-store'
import type { ProgressStage } from '@/types/progressTypes'
import { PROGRESS_DELAY, TOOL_LABELS_ACCUSATIVE, TOOL_LABELS_GENITIVE } from '@/constants/progress'
import { saveLectureInternal } from '@/actions/lectures'
import { getLectureByHash } from '@/server/queries'
import { revalidatePath } from 'next/cache'

async function progressStep(
  jobId: string | null,
  stage: ProgressStage,
  percent: number,
  userMessage: string,
  technicalCategory: string,
  technicalMessage: string
): Promise<void> {
  if (!jobId) return
  await emitProgress(jobId, stage, percent)
  await logUser(jobId, userMessage)
  await logTechnical(jobId, technicalCategory, technicalMessage)
  await new Promise(resolve => setTimeout(resolve, PROGRESS_DELAY))
}

async function resolveDisplayNameToUri(displayName: string, userId: string): Promise<string | null> {
  try {
    // Only the student's own notes and materials: an attachment can never reach
    // outside the user, and nothing in the request path reads from disk.
    const resources: Resource[] = []

    if (userId) {
      const [notes, materials] = await Promise.all([
        getAllUserNotes(userId),
        getMaterialsByUser(userId),
      ])

      const noteResources: Resource[] = notes.map((note) => ({
        name: `note://${note.id}`,
        displayName: note.title,
        type: 'note' as const,
      }))

      const materialResources: Resource[] = materials.map((material) => ({
        name: `material://${material.id}`,
        displayName: material.title,
        type: 'material' as const,
      }))

      resources.push(...noteResources, ...materialResources)
    }

    // Try exact match first, then normalized match
    const normalizedSearch = displayName.toLowerCase().trim()
    const resource = resources.find((r: Resource) =>
      r.displayName.toLowerCase().trim() === normalizedSearch
    )

    return resource ? resource.name : null
  } catch (error) {
    console.error('Failed to resolve displayName to URI:', error)
    return null
  }
}

type ResourceContent =
  | { type: 'text'; content: string }
  | { type: 'pdf'; title: string; base64: string; mimeType: string }

async function fetchResourceContent(uri: string, userId: string): Promise<ResourceContent> {
  if (uri.startsWith('note://')) {
    const noteId = uri.replace('note://', '')
    const note = await getNoteById(userId, noteId)
    return { type: 'text', content: note ? `# ${note.title}\n\n${note.plainText || ''}` : '' }
  }

  if (uri.startsWith('material://')) {
    const materialId = uri.replace('material://', '')
    const material = await getMaterialById(userId, materialId)

    if (!material) {
      return { type: 'text', content: '' }
    }

    // The text was read once at upload, so an attached PDF costs a database
    // read rather than a download plus a base64 copy of the whole file on every
    // single question about it.
    if (material.extractedText) {
      return { type: 'text', content: `# ${material.title}\n\n${material.extractedText}` }
    }

    // Not extracted yet, or extraction failed: fall back to shipping the file.
    try {
      const response = await fetch(material.url)
      if (!response.ok) {
        console.error('[Action] Failed to fetch material:', response.status)
        return { type: 'text', content: `[Failed to fetch: ${material.title}]` }
      }

      const arrayBuffer = await response.arrayBuffer()
      const base64 = Buffer.from(arrayBuffer).toString('base64')

      return {
        type: 'pdf',
        title: material.title,
        base64,
        mimeType: material.type || 'application/pdf'
      }
    } catch (error) {
      console.error('[Action] Error fetching material:', error)
      return { type: 'text', content: `[Error fetching: ${material.title}]` }
    }
  }

  return { type: 'text', content: '' }
}

export async function askRagQuestion(
  formState: FormState,
  formData: FormData
): Promise<FormState> {
  const jobId = formData.get('jobId') as string | null

  if (jobId) {
    await createJob(jobId)
  }

  try {
    const { userId } = await auth()
    if (!userId) throw new Error("Unauthorized")

    const isPremium = await checkPremiumAccessAction()
    if (!isPremium) {
      if (jobId) await errorJob(jobId, 'Premium access required')
      return toFormState('ERROR', 'Funkcja dostępna tylko dla użytkowników premium.')
    }

    const rateLimit = await checkRateLimit(userId, 'rag:query')
    if (!rateLimit.success) {
      const resetMinutes = Math.ceil((rateLimit.reset - Date.now()) / 60000)
      if (jobId) await errorJob(jobId, 'Rate limit exceeded')
      return toFormState(
        'ERROR',
        `Zbyt wiele zapytań. Spróbuj ponownie za ${resetMinutes} minut.`
      )
    }

    const question = formData.get('question') as string
    const cellId = formData.get('cellId') as string
    const searchTopicField = (formData.get('searchTopic') as string | null)?.trim()
    const commandsEnabled = formData.get('commandsEnabled') !== 'false'
    const commandField = (formData.get('command') as string | null)?.trim()
    const commandCountField = (formData.get('commandCount') as string | null)?.trim()

    await progressStep(
      jobId, 'parsing', 10,
      'Analizuję zapytanie...',
      'PARSE', `Input question: "${question.slice(0, 50)}${question.length > 50 ? '...' : ''}"`
    )

    const validationResult = RagQuerySchema.safeParse({
      question,
      cellId,
      ...(searchTopicField ? { searchTopic: searchTopicField } : {}),
      ...(commandField ? { command: commandField } : {}),
      ...(commandCountField ? { commandCount: commandCountField } : {}),
    })

    if (!validationResult.success) {
      if (jobId) await errorJob(jobId, 'Nieprawidłowe zapytanie', `Validation error: ${validationResult.error.message}`)
      return fromErrorToFormState(validationResult.error)
    }

    const parsed = parseMcpCommands(validationResult.data.question, { commandsEnabled })
    const { cleanQuestion, resources, unknownTools } = parsed
    const searchTopic = validationResult.data.searchTopic

    // A chip is an explicit mode, so it wins over anything typed. Slash stays as
    // an accelerator and lands on the same invocation.
    const selectedCommand = validationResult.data.command
    const tools = selectedCommand ? [selectedCommand] : parsed.tools

    // The count reaches the tool as a validated number rather than as prose the
    // dispatch model has to re-extract. That extraction failing, and a silent
    // default absorbing the failure, is what turned „10 pytań" into 5.
    //
    // Both surfaces converge here: the chip palette posts commandCount, a typed
    // „/utworz 10 …" yields the same number from its leading token, and either
    // way it is clamped by the command's own spec before dispatch.
    const commandSpec = tools[0] ? TOOL_COMMANDS[tools[0]] : undefined
    const rawCount = validationResult.data.commandCount ?? extractLeadingCount(cleanQuestion)
    const requestedCount = resolveCommandCount(commandSpec, rawCount)
    const countOverride =
      commandSpec?.count && requestedCount !== null
        ? { [commandSpec.count.param]: requestedCount }
        : undefined

    // Without this an unrecognised command falls through to a free-form question,
    // where the model may still call a tool with arguments it invented.
    if (unknownTools.length > 0 && tools.length === 0) {
      const available = TOOL_COMMAND_NAMES.map((name) => `/${name}`).join(', ')
      if (jobId) await errorJob(jobId, 'Nieznane polecenie', `Unknown command: /${unknownTools[0]}`)
      return toFormState(
        'ERROR',
        `Nieznane polecenie /${unknownTools[0]}. Dostępne polecenia: ${available}`
      )
    }

    if (tools.length > 0 && tools[0]) {
      const toolName = tools[0]
      await progressStep(
        jobId, 'parsing', 15,
        `Wykryto polecenie: /${toolName}`,
        'PARSE', `Found tool command: ${toolName} -> will use ${toolName}_tool`
      )
      await progressStep(
        jobId, 'parsing', 20,
        `Przygotowuję ${TOOL_LABELS_ACCUSATIVE[toolName] || toolName}...`,
        'PARSE', `Preparing to execute ${toolName}_tool`
      )
    }
    if (resources.length > 0) {
      await progressStep(
        jobId, 'parsing', 25,
        `Wykryto ${resources.length} zasób(y) do pobrania`,
        'PARSE', `Found @resources: ${resources.join(', ')}`
      )
    }

    let additionalContext = ''
    let pdfFiles: Array<{ title: string; base64: string; mimeType: string }> = []
    // Ids behind the resolved @resources, so retrieval can load those exact
    // sources rather than searching for something the student already named.
    const attachmentSourceIds: string[] = []

    if (resources.length > 0) {
      await progressStep(
        jobId, 'resolving', 30,
        'Rozwiązuję referencje zasobów...',
        'RESOLVE', `Resolving ${resources.length} resource references`
      )
      try {
        const resolvedUris = await Promise.all(
          resources.map(async (displayName) => {
            const uri = await resolveDisplayNameToUri(displayName, userId)
            return uri ? { displayName, uri } : null
          })
        )

        const validResources = resolvedUris.filter((r): r is { displayName: string; uri: string } => r !== null)

        attachmentSourceIds.push(
          ...validResources.map(({ uri }) => uri.replace(/^(note|material):\/\//, ''))
        )

        if (validResources.length > 0) {
          await progressStep(
            jobId, 'fetching', 40,
            `Pobieram: ${validResources.map(r => r.displayName).join(', ')}`,
            'FETCH', `Fetching ${validResources.length} resources: ${validResources.map(r => r.uri).join(', ')}`
          )
          const resourceResults = await Promise.all(
            validResources.map(async ({ uri }) => fetchResourceContent(uri, userId))
          )

          // Separate text content and PDF files
          const textContents: string[] = []
          for (const result of resourceResults) {
            if (result.type === 'text' && result.content) {
              textContents.push(result.content)
            } else if (result.type === 'pdf') {
              pdfFiles.push({
                title: result.title,
                base64: result.base64,
                mimeType: result.mimeType
              })
            }
          }

          if (textContents.length > 0) {
            additionalContext = `Context from files:\n${textContents.join('\n\n')}`
          }
        }
      } catch (error) {
        console.error('Failed to fetch resources:', error)
      }
    }

    if (tools.length > 0) {
      const toolName = tools[0]
      const command = toolName ? TOOL_COMMANDS[toolName] : undefined
      const toolDefinition = command
        ? TOOL_DEFINITIONS.find((t) => t.name === command.toolName)
        : undefined

      if (!toolDefinition) {
        return toFormState('ERROR', `Unknown tool: ${toolName}`)
      }

      if (jobId) {
        await emitProgress(jobId, 'calling_tool', 50, undefined, { tool: toolDefinition.name })
      }
      await progressStep(
        jobId, 'calling_tool', 50,
        `Rozpoczynam generowanie ${TOOL_LABELS_GENITIVE[toolDefinition.name] || 'zawartości'}...`,
        'TOOL', `Preparing to call ${toolDefinition.name}`
      )

      // Handle empty question - need either a topic or resource context
      const hasUserResource = !!additionalContext || pdfFiles.length > 0
      if (!cleanQuestion.trim() && !hasUserResource) {
        if (jobId) await errorJob(jobId, 'Brak tematu lub zasobu', `Missing topic or resource for tool: ${toolName}`)
        return toFormState('ERROR', `Podaj temat lub użyj @zasobu. Przykład: "/${toolName} fizjologia serca" lub "@MójDokument /${toolName}"`)
      }

      // If no explicit topic but has resource context, use a default query
      const effectiveQuestion = cleanQuestion.trim()
        ? cleanQuestion
        : 'Przeanalizuj powyższą treść i przygotuj odpowiedź na jej podstawie'

      // Build merged content: user's @resource (PRIMARY) + RAG results (SECONDARY)
      let toolInputContent = ''

      // PRIMARY: User's @resource content (if provided)
      if (additionalContext) {
        toolInputContent += `=== GŁÓWNE ŹRÓDŁO (wybrane przez użytkownika) ===\n${additionalContext}\n\n`
      }

      // SECONDARY: File Search results (supplementary info from knowledge base).
      // Skip entirely when the user attached their own @resource/PDF — that is
      // the primary source, so the extra grounded RAG round-trip is pure waste.
      if (!hasUserResource) {
        await progressStep(
          jobId, 'searching', 60,
          'Przeszukuję bazę wiedzy...',
          'RAG', `Query: "${effectiveQuestion.slice(0, 50)}..."`
        )
        // Raw chunks, not a generated summary of them: one Flash call cheaper and
        // the tool sees the source wording instead of a paraphrase.
        //
        // canonical_only: a generator builds study material, and material built
        // partly on the student's own half-written note would be indistinguishable
        // from material built on the curriculum. Widening this is a later,
        // deliberate step — see the plan's staged rollout.
        const corpus = await retrieveContext({
          userId,
          query: effectiveQuestion,
          mode: 'canonical_only',
        })
        if (corpus.chunks.length > 0) {
          toolInputContent += `=== DODATKOWE INFORMACJE (z bazy wiedzy) ===\n${formatContextChunks(corpus.chunks)}\n\n`
          const topic = effectiveQuestion.split(' ').slice(0, 4).join(' ')
          await progressStep(
            jobId, 'searching', 65,
            `Znaleziono informacje na temat: ${topic}`,
            'RAG', `Retrieved ${corpus.chunks.length} chunks from: ${corpus.sources.join(', ') || 'unnamed sources'}`
          )
        }
      } else {
        await progressStep(
          jobId, 'searching', 60,
          'Używam wybranego źródła...',
          'RAG', 'Skipping knowledge base — user provided a primary source'
        )
      }

      // The dispatch call forces a function call, so a source-backed tool handed an
      // empty prompt invents its own subject instead of declining. Stop before that.
      if (command?.requiresSource && !toolInputContent.trim() && pdfFiles.length === 0) {
        if (jobId) await errorJob(jobId, 'Brak materiałów', `No grounded content for ${toolDefinition.name}`)
        return toFormState(
          'ERROR',
          `Nie znalazłem w bazie wiedzy materiałów na temat "${effectiveQuestion}". Doprecyzuj temat lub dołącz własne źródło przez @zasób.`
        )
      }

      await progressStep(
        jobId, 'executing', 75,
        'Generuję zawartość z AI...',
        'LLM', `Sending request to Gemini (input: ${toolInputContent.length} chars)`
      )
      const toolResult = await executeToolWithContent(toolDefinition.name, toolDefinition, {
        request: effectiveQuestion,
        content: toolInputContent,
        pdfFiles,
        ...(countOverride ? { overrideArgs: countOverride } : {}),
      })

      await progressStep(
        jobId, 'finalizing', 95,
        'Generowanie zakończone!',
        'LLM', `Response received, tool execution complete`
      )
      if (jobId) await completeJob(jobId)

      // The answer is payload for the cell, not toast text: FormState.message is
      // what useToastMessage shows, so it stays a short human status.
      const generated = toolResult.toolResults?.[toolDefinition.name]?.metadata
      const label = (toolName && TOOL_LABELS_ACCUSATIVE[toolName]) || 'zawartość'

      // A generator that came up short says so. Silently returning 7 of the 10
      // asked for is indistinguishable, to the student, from the request never
      // having arrived.
      const statusMessage =
        generated?.shortfall > 0
          ? `Utworzono ${generated.count} z ${generated.requested} — model nie zwrócił pełnej liczby. Spróbuj ponownie lub zawęź temat.`
          : `Gotowe — utworzono ${label}`

      return {
        ...toFormState('SUCCESS', statusMessage),
        values: {
          answer: toolResult.answer,
          sources: [],
          toolResults: toolResult.toolResults
        }
      }
    }

    // Memory-answered guard: questions about the student's OWN state (progress,
    // exam, what to revise) are answered from memory alone — no corpus retrieval,
    // no Flash grounding. Only when the student didn't attach their own resource.
    if (!additionalContext && pdfFiles.length === 0 && isSelfStateQuestion(cleanQuestion)) {
      const selfState = await buildSelfStateContext(userId)
      if (selfState) {
        await progressStep(
          jobId, 'searching', 60,
          'Sprawdzam Twój postęp...',
          'MEMORY', 'Self-state question — answering from memory, skipping corpus'
        )
        const memAnswer = await answerFromMemory(cleanQuestion, selfState)
        if (jobId) await completeJob(jobId)
        return {
          ...toFormState('SUCCESS', 'Odpowiedź gotowa'),
          values: { answer: memAnswer.answer, sources: [] },
        }
      }
    }

    await progressStep(
      jobId, 'searching', 50,
      'Przeszukuję bazę wiedzy...',
      'RAG', `Query: "${cleanQuestion.slice(0, 50)}..."`
    )

    // Path A memory: active policies + preferences in the static (cache-friendly)
    // prefix. Path B: retrieved facts + recent episodes in the volatile tail.
    // Both fail-safe — return '' if memory is unavailable.
    const memoryPrefix = await buildStaticPrefix(userId)
    const memoryTail = await buildMemoryTail(userId, cleanQuestion)

    const hasAttachment = attachmentSourceIds.length > 0 || pdfFiles.length > 0

    // An attachment is the student's explicit pick, so it is the primary source
    // and the corpus is not consulted. Without one, the tutor reads the
    // curriculum and — capped, floored and labelled — the student's own library.
    const context = await retrieveContext({
      userId,
      // Retrieval sees the subject alone. Memory and attachments ride in the
      // generation prompt; putting them in front of the subject is what made
      // corpus terms come back as "no information".
      query: searchTopic || cleanQuestion,
      mode: hasAttachment ? 'explicit_resource' : 'canonical_with_personal',
      ...(attachmentSourceIds.length ? { attachmentSourceIds } : {}),
    })

    // Nothing from the curriculum and nothing the student attached: answering
    // anyway would mean writing curriculum from the model's own knowledge, which
    // is the failure the source rule exists to prevent.
    if (!context.hasCanonical && context.chunks.length === 0) {
      if (jobId) await completeJob(jobId)
      return {
        ...toFormState('SUCCESS', 'Brak materiałów'),
        values: { answer: getNoDataFoundMessage(), sources: [] },
      }
    }

    const result = await generateGroundedAnswer(cleanQuestion, context, {
      ...(additionalContext ? { userContext: additionalContext } : {}),
      ...(memoryTail ? { memoryTail } : {}),
      ...(memoryPrefix ? { memoryPrefix } : {}),
    })

    const topic = cleanQuestion.split(' ').slice(0, 4).join(' ')
    await progressStep(
      jobId, 'executing', 80,
      `Znaleziono odpowiedź na temat: ${topic}`,
      'RAG', `Found answer (${result.answer?.length || 0} chars), sources: ${result.sources?.length ? result.sources.join(', ') : 'none — retrieval returned nothing'}`
    )
    await progressStep(
      jobId, 'finalizing', 95,
      'Przetwarzanie zakończone!',
      'RAG', `Query completed successfully`
    )
    if (jobId) await completeJob(jobId)

    return {
      ...toFormState('SUCCESS', 'Odpowiedź gotowa'),
      values: {
        answer: result.answer,
        sources: result.sources
      }
    }
  } catch (error) {
    console.error('Error querying RAG:', error)
    if (jobId) {
      const technicalMsg = error instanceof Error ? `${error.name}: ${error.message}` : 'Unknown error'
      await errorJob(jobId, 'Coś poszło nie tak. Spróbuj ponownie.', technicalMsg)
    }
    return fromErrorToFormState(error)
  }
}

export async function generateLectureAction(
  planContent: string,
  jobId: string
): Promise<FormState> {
  await createJob(jobId)

  try {
    const { userId } = await auth()
    if (!userId) throw new Error('Unauthorized')

    const isPremium = await checkPremiumAccessAction()
    if (!isPremium) {
      await errorJob(jobId, 'Premium access required')
      return toFormState('ERROR', 'Funkcja dostępna tylko dla użytkowników premium.')
    }

    const rateLimit = await checkRateLimit(userId, 'lecture:generate')
    if (!rateLimit.success) {
      const resetMinutes = Math.ceil((rateLimit.reset - Date.now()) / 60000)
      await errorJob(jobId, 'Rate limit exceeded')
      return toFormState('ERROR', `Zbyt wiele zapytań. Spróbuj ponownie za ${resetMinutes} minut.`)
    }

    let topic = 'temat'
    try {
      const plan = JSON.parse(planContent)
      topic = plan.topic || topic
    } catch { /* use default */ }

    const contentHash = crypto.createHash('sha256').update(planContent).digest('hex')
    const existing = await getLectureByHash(userId, contentHash)
    if (existing) {
      await completeJob(jobId)
      revalidatePath('/panel/nauka')
      return {
        ...toFormState('SUCCESS', 'Wykład gotowy!'),
        values: {
          audioUrl: existing.audioUrl,
          title: existing.title,
          transcript: existing.scriptText,
          lectureId: existing.id,
        },
      }
    }

    await progressStep(
      jobId, 'searching', 30,
      'Przeszukuję bazę wiedzy...',
      'RAG', 'Querying knowledge base for lecture content'
    )

    // canonical_only: a lecture is study material, so it is built on the
    // curriculum alone.
    const corpus = await retrieveContext({ userId, query: topic, mode: 'canonical_only' })
    let enrichedContent = planContent
    if (corpus.chunks.length > 0) {
      enrichedContent = `${planContent}\n\n=== DODATKOWE INFORMACJE Z BAZY WIEDZY ===\n${formatContextChunks(corpus.chunks)}`
      await progressStep(
        jobId, 'searching', 55,
        `Znaleziono materiały na temat: ${topic}`,
        'RAG', `Retrieved ${corpus.chunks.length} chunks from: ${corpus.sources.join(', ') || 'unnamed sources'}`
      )
    }

    await progressStep(
      jobId, 'executing', 70,
      'Generuję skrypt wykładu...',
      'LLM', 'Generating spoken lecture script with Gemini'
    )

    const toolResult = await executeToolLocally('wyklad_tool', { content: enrichedContent })
    const script = toolResult.content

    await progressStep(
      jobId, 'finalizing', 85,
      'Syntezuję głos...',
      'TTS', `Converting script (${script.length} chars) to audio`
    )

    const apiKey = process.env.GOOGLE_TTS_API_KEY
    if (!apiKey) throw new Error('GOOGLE_TTS_API_KEY is not configured')

    // Split script into chunks under 4800 bytes (UTF-8 safe, split on sentence boundaries)
    const chunks: string[] = []
    const sentences = script.split(/(?<=[.!?])\s+/)
    let current = ''
    for (const sentence of sentences) {
      const candidate = current ? `${current} ${sentence}` : sentence
      if (Buffer.byteLength(candidate, 'utf8') > 4800) {
        if (current) chunks.push(current)
        current = sentence
      } else {
        current = candidate
      }
    }
    if (current) chunks.push(current)

    const audioBuffers: Buffer[] = []
    for (const chunk of chunks) {
      const ttsResponse = await fetch(
        `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            input: { text: chunk },
            voice: { languageCode: 'pl-PL', name: 'pl-PL-Wavenet-A' },
            audioConfig: { audioEncoding: 'MP3' },
          }),
        }
      )

      if (!ttsResponse.ok) {
        const err = await ttsResponse.text()
        throw new Error(`Google TTS error: ${ttsResponse.status} ${err}`)
      }

      const ttsData = await ttsResponse.json() as { audioContent: string }
      audioBuffers.push(Buffer.from(ttsData.audioContent, 'base64'))
    }

    const audioBuffer = Buffer.concat(audioBuffers)

    await progressStep(
      jobId, 'finalizing', 90,
      'Zapisuję plik audio...',
      'UPLOAD', `Uploading audio (${audioBuffer.length} bytes) to storage`
    )

    const lecture = await saveLectureInternal({
      userId,
      title: topic,
      contentHash,
      audioBuffer,
      scriptText: script,
    })

    await progressStep(
      jobId, 'finalizing', 95,
      'Wykład gotowy!',
      'UPLOAD', `Lecture saved with id: ${lecture.id}`
    )
    await completeJob(jobId)
    revalidatePath('/panel/nauka')

    return {
      ...toFormState('SUCCESS', 'Wykład gotowy!'),
      values: {
        audioUrl: lecture.audioUrl,
        title: lecture.title,
        transcript: lecture.scriptText,
        lectureId: lecture.id,
      },
    }
  } catch (error) {
    console.error('Error generating lecture:', error)
    const technicalMsg = error instanceof Error ? `${error.name}: ${error.message}` : 'Unknown error'
    await errorJob(jobId, 'Nie udało się wygenerować wykładu.', technicalMsg)
    return fromErrorToFormState(error)
  }
}
