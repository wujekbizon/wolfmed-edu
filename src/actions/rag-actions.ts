'use server'

import { auth } from '@clerk/nextjs/server'
import { fromErrorToFormState, toFormState } from '@/helpers/toFormState'
import { FormState } from '@/types/actionTypes'
import { checkRateLimit } from '@/lib/rateLimit'
import { RagQuerySchema } from '@/server/schema'
import { queryWithFileSearch, queryFileSearchOnly, executeToolWithContent } from '@/server/google-rag'
import { parseMcpCommands } from '@/helpers/parse-mcp-commands'
import { getNoteById, getAllUserNotes, getMaterialsByUser } from '@/server/queries'
import type { Resource } from '@/types/resourceTypes'
import { TOOL_DEFINITIONS } from '@/server/tools/definitions'
import { mcpServer } from '@/server/mcp/server'

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

    // Log available resources for debugging
    console.log('[Action] Available resources:', resources.map((r: Resource) => r.displayName))
    console.log('[Action] Looking for:', displayName)

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

async function fetchResourceContent(uri: string, userId: string): Promise<string> {
  if (uri.startsWith('note://')) {
    const noteId = uri.replace('note://', '')
    const note = await getNoteById(userId, noteId)
    return note ? `# ${note.title}\n\n${note.plainText || ''}` : ''
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

    console.log('[Action] Parsed commands:', {
      resources,
      tools,
      cleanQuestion: cleanQuestion.substring(0, 50) + '...'
    })

    let additionalContext = ''
    if (resources.length > 0) {
      try {
        const resolvedUris = await Promise.all(
          resources.map(async (displayName) => {
            const uri = await resolveDisplayNameToUri(displayName, userId)
            console.log('[Action] Resolved URI:', { displayName, uri })
            return uri ? { displayName, uri } : null
          })
        )

        const validResources = resolvedUris.filter((r): r is { displayName: string; uri: string } => r !== null)
        console.log('[Action] Valid resources:', validResources.length)

        if (validResources.length > 0) {
          const resourceResults = await Promise.all(
            validResources.map(async ({ uri }) => {
              const content = await fetchResourceContent(uri, userId)
              console.log('[Action] Fetched content:', { uri, contentLength: content.length })
              return content
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

      // Handle empty question - need either a topic or resource context
      if (!cleanQuestion.trim() && !additionalContext) {
        return toFormState('ERROR', `Podaj temat lub użyj @zasobu. Przykład: "/${toolName} fizjologia serca" lub "@MójDokument /${toolName}"`)
      }

      // If no explicit topic but has resource context, use a default query
      const effectiveQuestion = cleanQuestion.trim()
        ? cleanQuestion
        : 'Przeanalizuj powyższą treść i przygotuj odpowiedź na jej podstawie'

      console.log('[Action] Phase 1 query:', {
        effectiveQuestion,
        hasContext: !!additionalContext,
        contextLength: additionalContext?.length || 0
      })

      // Build merged content: user's @resource (PRIMARY) + RAG results (SECONDARY)
      let toolInputContent = ''

      // PRIMARY: User's @resource content (if provided)
      if (additionalContext) {
        toolInputContent += `=== GŁÓWNE ŹRÓDŁO (wybrane przez użytkownika) ===\n${additionalContext}\n\n`
      }

      // SECONDARY: File Search results (supplementary info from knowledge base)
      const ragResult = await queryFileSearchOnly(effectiveQuestion)
      if (ragResult.answer) {
        toolInputContent += `=== DODATKOWE INFORMACJE (z bazy wiedzy) ===\n${ragResult.answer}\n\n`
      }

      console.log('[Action] Merged content for tool:', {
        hasUserResource: !!additionalContext,
        hasRagResult: !!ragResult.answer,
        totalLength: toolInputContent.length
      })

      const toolResult = await executeToolWithContent(
        toolDefinition.name,
        toolInputContent,
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
    return fromErrorToFormState(error)
  }
}
