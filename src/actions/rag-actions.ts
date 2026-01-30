'use server'

import { auth } from '@clerk/nextjs/server'
import { fromErrorToFormState, toFormState } from '@/helpers/toFormState'
import { FormState } from '@/types/actionTypes'
import { checkRateLimit } from '@/lib/rateLimit'
import { RagQuerySchema } from '@/server/schema'
import { queryWithFileSearch } from '@/server/google-rag'
import { parseMcpCommands } from '@/helpers/parse-mcp-commands'
import { getNoteById } from '@/server/queries'
import type { Resource } from '@/types/resourceTypes'
import { TOOL_DEFINITIONS } from '@/server/tools/definitions'

async function resolveDisplayNameToUri(displayName: string, userId: string): Promise<string | null> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const response = await fetch(`${baseUrl}/api/mcp/resources`)
    const data = await response.json()

    if (data.error || !data.resources) {
      return null
    }

    const resource = data.resources.find((r: Resource) =>
      r.displayName.toLowerCase() === displayName.toLowerCase()
    )

    return resource ? resource.name : null
  } catch (error) {
    console.error('Failed to resolve displayName to URI:', error)
    return null
  }
}

async function fetchResourceContent(uri: string, userId: string): Promise<string> {
  if (uri.startsWith('note://')) {
    const noteId = uri.replace('note://', '')
    const note = await getNoteById(noteId, userId)
    return note ? `# ${note.title}\n\n${note.content}` : ''
  }

  if (uri.startsWith('material://')) {
    const materialId = uri.replace('material://', '')
    return `[Material ${materialId} - content fetching not yet implemented]`
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const response = await fetch(`${baseUrl}/api/mcp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tool: 'read', args: { filename: uri } }),
  })
  const data = await response.json()
  return data.content?.[0]?.text || ''
}

export async function askRagQuestion(
  formState: FormState,
  formData: FormData
): Promise<FormState> {
  try {
    const { userId } = await auth()
    if (!userId) throw new Error("Unauthorized")
      
    const rateLimit = await checkRateLimit(userId, 'rag:query')
    if (!rateLimit.success) {
      const resetMinutes = Math.ceil((rateLimit.reset - Date.now()) / 60000)
      return toFormState(
        'ERROR',
        `Zbyt wiele zapytań. Spróbuj ponownie za ${resetMinutes} minut.`
      )
    }

    const question = formData.get('question') as string
    const cellId = formData.get('cellId') as string

    const validationResult = RagQuerySchema.safeParse({
      question,
      cellId,
    })

    if (!validationResult.success) {
      return fromErrorToFormState(validationResult.error)
    }

    const { cleanQuestion, resources, tools } = parseMcpCommands(validationResult.data.question)

    const lowerQuestion = validationResult.data.question.toLowerCase()
    let toolGuidance = ''
    if (lowerQuestion.includes('stwórz') || lowerQuestion.includes('utwórz') || lowerQuestion.includes('wygeneruj')) {
      if (lowerQuestion.includes('notat')) {
        toolGuidance = '\n\nIMPORTANT: User is requesting to CREATE A NOTE. You MUST use the notatka_tool function.'
      } else if (lowerQuestion.includes('test') || lowerQuestion.includes('pytań') || lowerQuestion.includes('quiz')) {
        toolGuidance = '\n\nIMPORTANT: User is requesting to CREATE TEST QUESTIONS. You MUST use the utworz_test function.'
      } else if (lowerQuestion.includes('podsumuj') || lowerQuestion.includes('podsumowanie')) {
        toolGuidance = '\n\nIMPORTANT: User is requesting a SUMMARY. You MUST use the podsumuj function.'
      } else if (lowerQuestion.includes('diagram') || lowerQuestion.includes('schemat') || lowerQuestion.includes('wizualizacj')) {
        toolGuidance = '\n\nIMPORTANT: User is requesting to CREATE A DIAGRAM. You MUST use the diagram_tool function.'
      }
    }

    let additionalContext = toolGuidance
    if (resources.length > 0) {
      try {
        const resolvedUris = await Promise.all(
          resources.map(async (displayName) => {
            const uri = await resolveDisplayNameToUri(displayName, userId)
            return uri ? { displayName, uri } : null
          })
        )

        const validResources = resolvedUris.filter((r): r is { displayName: string; uri: string } => r !== null)

        if (validResources.length > 0) {
          const resourceResults = await Promise.all(
            validResources.map(async ({ uri }) => {
              return await fetchResourceContent(uri, userId)
            })
          )
          const resourceContext = `Context from files:\n${resourceResults.join('\n\n')}`
          additionalContext = toolGuidance ? `${toolGuidance}\n\n${resourceContext}` : resourceContext
        }
      } catch (error) {
        console.error('Failed to fetch resources:', error)
      }
    }

    const result = await queryWithFileSearch(
      cleanQuestion,
      undefined,
      additionalContext || undefined,
      [...TOOL_DEFINITIONS]
    )

    console.log('[Action] Server action returning toolResults:', result.toolResults)

    return {
      ...toFormState('SUCCESS', result.answer),
      values: {
        sources: result.sources,
        toolResults: result.toolResults
      }
    }
  } catch (error) {
    console.error('Error querying RAG:', error)
    return fromErrorToFormState(error)
  }
}
