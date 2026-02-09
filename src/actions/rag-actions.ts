'use server'

import { auth } from '@clerk/nextjs/server'
import { fromErrorToFormState, toFormState } from '@/helpers/toFormState'
import { FormState } from '@/types/actionTypes'
import { checkRateLimit } from '@/lib/rateLimit'
import { RagQuerySchema } from '@/server/schema'
import { queryWithFileSearch, queryFileSearchOnly, executeToolWithContent } from '@/server/google-rag'
import { parseMcpCommands } from '@/helpers/parse-mcp-commands'
import { getNoteById, getAllUserNotes, getMaterialsByUser, getMaterialById } from '@/server/queries'
import type { Resource } from '@/types/resourceTypes'
import { TOOL_DEFINITIONS } from '@/server/tools/definitions'
import { mcpServer } from '@/server/mcp/server'
import { createJob, emitProgress, logUser, logTechnical, completeJob, errorJob } from '@/lib/progress-store'

async function resolveDisplayNameToUri(displayName: string, userId: string): Promise<string | null> {
  try {
    // Build resources list directly from DB (not API) to include user's notes/materials
    const resources: Resource[] = []

    // Get docs from MCP server
    const mcpResult = await mcpServer.readResource('docs://list')
    const fileList = mcpResult.contents?.[0]?.text
      ? JSON.parse(mcpResult.contents[0].text)
      : []

    const docResources: Resource[] = fileList.map((filename: string) => ({
      name: filename,
      displayName: filename.replace('.md', '').replace(/_/g, ' '),
      type: 'doc' as const,
    }))
    resources.push(...docResources)

    // Get user's notes and materials directly from DB
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

    // Fetch PDF bytes from the URL
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

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const response = await fetch(`${baseUrl}/api/mcp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tool: 'read', args: { filename: uri } }),
  })
  const data = await response.json()
  return { type: 'text', content: data.content?.[0]?.text || '' }
}

export async function askRagQuestion(
  formState: FormState,
  formData: FormData
): Promise<FormState> {
  const jobId = formData.get('jobId') as string | null

  if (jobId) {
    createJob(jobId)
  }

  try {
    const { userId } = await auth()
    if (!userId) throw new Error("Unauthorized")

    const rateLimit = await checkRateLimit(userId, 'rag:query')
    if (!rateLimit.success) {
      const resetMinutes = Math.ceil((rateLimit.reset - Date.now()) / 60000)
      if (jobId) errorJob(jobId, 'Rate limit exceeded')
      return toFormState(
        'ERROR',
        `Zbyt wiele zapytań. Spróbuj ponownie za ${resetMinutes} minut.`
      )
    }

    const question = formData.get('question') as string
    const cellId = formData.get('cellId') as string

    if (jobId) {
      emitProgress(jobId, 'parsing', 10)
      logUser(jobId, 'Analizuję zapytanie...')
      logTechnical(jobId, 'PARSE', `Input question: "${question.slice(0, 50)}${question.length > 50 ? '...' : ''}"`)
    }

    const validationResult = RagQuerySchema.safeParse({
      question,
      cellId,
    })

    if (!validationResult.success) {
      if (jobId) errorJob(jobId, 'Nieprawidłowe zapytanie', `Validation error: ${validationResult.error.message}`)
      return fromErrorToFormState(validationResult.error)
    }

    const { cleanQuestion, resources, tools } = parseMcpCommands(validationResult.data.question)

    if (jobId && tools.length > 0 && tools[0]) {
      const toolName = tools[0]
      const toolLabels: Record<string, string> = {
        'notatka': 'notatkę',
        'diagram': 'diagram',
        'utworz': 'test',
        'podsumuj': 'podsumowanie'
      }
      logUser(jobId, `Wykryto polecenie: /${toolName}`)
      logTechnical(jobId, 'PARSE', `Found tool command: ${toolName} -> will use ${toolName}_tool`)
      emitProgress(jobId, 'parsing', 20)
      logUser(jobId, `Przygotowuję ${toolLabels[toolName] || toolName}...`)
    }
    if (jobId && resources.length > 0) {
      logUser(jobId, `Wykryto ${resources.length} zasób(y) do pobrania`)
      logTechnical(jobId, 'PARSE', `Found @resources: ${resources.join(', ')}`)
    }

    let additionalContext = ''
    let pdfFiles: Array<{ title: string; base64: string; mimeType: string }> = []

    if (resources.length > 0) {
      if (jobId) {
        emitProgress(jobId, 'resolving', 30)
        logUser(jobId, 'Rozwiązuję referencje zasobów...')
        logTechnical(jobId, 'RESOLVE', `Resolving ${resources.length} resource references`)
      }
      try {
        const resolvedUris = await Promise.all(
          resources.map(async (displayName) => {
            const uri = await resolveDisplayNameToUri(displayName, userId)
            return uri ? { displayName, uri } : null
          })
        )

        const validResources = resolvedUris.filter((r): r is { displayName: string; uri: string } => r !== null)

        if (validResources.length > 0) {
          if (jobId) {
            emitProgress(jobId, 'fetching', 40)
            for (const res of validResources) {
              logUser(jobId, `Pobieram: ${res.displayName}`)
            }
            logTechnical(jobId, 'FETCH', `Fetching ${validResources.length} resources: ${validResources.map(r => r.uri).join(', ')}`)
          }
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
      const toolMap: Record<string, any> = {
        'notatka': TOOL_DEFINITIONS.find(t => t.name === 'notatka_tool'),
        'utworz': TOOL_DEFINITIONS.find(t => t.name === 'utworz_test'),
        'podsumuj': TOOL_DEFINITIONS.find(t => t.name === 'podsumuj'),
        'diagram': TOOL_DEFINITIONS.find(t => t.name === 'diagram_tool')
      }

      if (!toolName || !toolMap[toolName]) {
        return toFormState('ERROR', `Unknown tool: ${toolName}`)
      }

      const toolDefinition = toolMap[toolName]

      const toolDisplayNames: Record<string, string> = {
        'notatka_tool': 'notatki',
        'diagram_tool': 'diagramu',
        'utworz_test': 'testu',
        'podsumuj': 'podsumowania'
      }

      if (jobId) {
        emitProgress(jobId, 'calling_tool', 50, undefined, { tool: toolDefinition.name })
        logUser(jobId, `Rozpoczynam generowanie ${toolDisplayNames[toolDefinition.name] || 'zawartości'}...`)
        logTechnical(jobId, 'TOOL', `Preparing to call ${toolDefinition.name}`)
      }

      // Handle empty question - need either a topic or resource context
      const hasUserResource = !!additionalContext || pdfFiles.length > 0
      if (!cleanQuestion.trim() && !hasUserResource) {
        if (jobId) errorJob(jobId, 'Brak tematu lub zasobu', `Missing topic or resource for tool: ${toolName}`)
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

      // SECONDARY: File Search results (supplementary info from knowledge base)
      if (jobId) {
        emitProgress(jobId, 'searching', 60)
        logUser(jobId, 'Przeszukuję bazę wiedzy...')
        logTechnical(jobId, 'RAG', `Query: "${effectiveQuestion.slice(0, 50)}..."`)
      }
      const ragResult = await queryFileSearchOnly(effectiveQuestion)
      if (ragResult.answer) {
        toolInputContent += `=== DODATKOWE INFORMACJE (z bazy wiedzy) ===\n${ragResult.answer}\n\n`
        if (jobId) {
          const topic = effectiveQuestion.split(' ').slice(0, 4).join(' ')
          logUser(jobId, `Znaleziono informacje na temat: ${topic}`)
          logTechnical(jobId, 'RAG', `Found ${ragResult.answer.length} chars of context`)
        }
      }

      if (jobId) {
        emitProgress(jobId, 'executing', 75)
        logUser(jobId, 'Generuję zawartość z AI...')
        logTechnical(jobId, 'LLM', `Sending request to Gemini (input: ${toolInputContent.length} chars)`)
      }
      const toolResult = await executeToolWithContent(
        toolDefinition.name,
        toolInputContent,
        toolDefinition,
        pdfFiles
      )

      if (jobId) {
        emitProgress(jobId, 'finalizing', 95)
        logUser(jobId, 'Generowanie zakończone!')
        logTechnical(jobId, 'LLM', `Response received, tool execution complete`)
        completeJob(jobId)
      }

      return {
        ...toFormState('SUCCESS', toolResult.answer),
        values: {
          sources: [],
          toolResults: toolResult.toolResults
        }
      }
    }

    if (jobId) {
      emitProgress(jobId, 'searching', 50)
      logUser(jobId, 'Przeszukuję bazę wiedzy...')
      logTechnical(jobId, 'RAG', `Query: "${cleanQuestion.slice(0, 50)}..."`)
    }

    const result = await queryFileSearchOnly(
      cleanQuestion,
      undefined,
      additionalContext || undefined
    )

    if (jobId) {
      emitProgress(jobId, 'executing', 80)
      const topic = cleanQuestion.split(' ').slice(0, 4).join(' ')
      logUser(jobId, `Znaleziono odpowiedź na temat: ${topic}`)
      logTechnical(jobId, 'RAG', `Found answer (${result.answer?.length || 0} chars), sources: ${result.sources?.length || 0}`)
      emitProgress(jobId, 'finalizing', 95)
      completeJob(jobId)
    }

    return {
      ...toFormState('SUCCESS', result.answer),
      values: {
        sources: result.sources
      }
    }
  } catch (error) {
    console.error('Error querying RAG:', error)
    if (jobId) {
      const technicalMsg = error instanceof Error ? `${error.name}: ${error.message}` : 'Unknown error'
      errorJob(jobId, 'Coś poszło nie tak. Spróbuj ponownie.', technicalMsg)
    }
    return fromErrorToFormState(error)
  }
}
