'use server'

import { auth } from '@clerk/nextjs/server'
import { fromErrorToFormState, toFormState } from '@/helpers/toFormState'
import { FormState } from '@/types/actionTypes'
import { checkRateLimit } from '@/lib/rateLimit'
import { RagQuerySchema } from '@/server/schema'
import { queryWithFileSearch, queryFileSearchOnly, executeToolWithContent } from '@/server/google-rag'
import { parseMcpCommands } from '@/helpers/parse-mcp-commands'
import { getNoteById } from '@/server/queries'
import type { Resource } from '@/types/resourceTypes'
import { TOOL_DEFINITIONS } from '@/server/tools/definitions'

function parseApiError(error: unknown): string {
  if (error instanceof Error) {
    try {
      const parsed = JSON.parse(error.message)
      if (parsed.error && parsed.error.message) {
        return parsed.error.message
      }
    } catch {
      return error.message
    }
    return error.message
  }
  return 'Wystąpił nieznany błąd'
}

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

    let additionalContext = ''
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
          additionalContext = `Context from files:\n${resourceResults.join('\n\n')}`
        }
      } catch (error) {
        console.error('Failed to fetch resources:', error)
      }
    }

    if (tools.length > 0) {
      console.log('[Action] Slash command detected, using two-phase execution:', tools)

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

      const ragResult = await queryFileSearchOnly(
        cleanQuestion,
        undefined,
        additionalContext || undefined
      )

      const toolResult = await executeToolWithContent(
        toolDefinition.name,
        ragResult.answer,
        toolDefinition
      )

      console.log('[Action] Two-phase execution complete, returning toolResults:', toolResult.toolResults)

      return {
        ...toFormState('SUCCESS', toolResult.answer),
        values: {
          sources: [],
          toolResults: toolResult.toolResults
        }
      }
    }

    console.log('[Action] No slash command, using regular RAG query')

    const result = await queryFileSearchOnly(
      cleanQuestion,
      undefined,
      additionalContext || undefined
    )

    return {
      ...toFormState('SUCCESS', result.answer),
      values: {
        sources: result.sources
      }
    }
  } catch (error) {
    console.error('Error querying RAG:', error)
    const errorMessage = parseApiError(error)
    return toFormState('ERROR', errorMessage)
  }
}
