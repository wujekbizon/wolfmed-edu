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

    if (resources.length === 0 && tools.length === 0) {
      const result = await queryWithFileSearch(validationResult.data.question)
      return {
        ...toFormState('SUCCESS', result.answer),
        values: { sources: result.sources }
      }
    }

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

    const toolDefinitions = [
      {
        name: 'utworz_test',
        description: 'Generate multiple-choice test questions in Polish based on provided content. Returns JSON format compatible with Wolfmed test system.',
        parameters: {
          type: 'object',
          properties: {
            questionCount: {
              type: 'number',
              description: 'Number of questions to generate (default: 5)'
            },
            category: {
              type: 'string',
              description: 'Category or course name (default: medycyna)'
            },
            content: {
              type: 'string',
              description: 'Content to generate questions from'
            }
          },
          required: ['content']
        }
      },
      {
        name: 'notatka_tool',
        description: 'Create a concise note (50-150 words) in Polish with key information. Returns markdown formatted note that will be opened as an editable cell.',
        parameters: {
          type: 'object',
          properties: {
            content: {
              type: 'string',
              description: 'Content to create note from'
            },
            focus: {
              type: 'string',
              description: 'Optional: specific aspect to focus on'
            }
          },
          required: ['content']
        }
      },
      {
        name: 'podsumuj',
        description: 'Create a comprehensive summary (200-500 words) in Polish with structured sections. Returns markdown formatted summary shown in response.',
        parameters: {
          type: 'object',
          properties: {
            content: {
              type: 'string',
              description: 'Content to summarize'
            }
          },
          required: ['content']
        }
      },
      {
        name: 'diagram_tool',
        description: 'Generate a visual diagram in Excalidraw format. Creates an editable diagram cell with shapes, arrows, and labels in Polish.',
        parameters: {
          type: 'object',
          properties: {
            content: {
              type: 'string',
              description: 'Content to create diagram from'
            },
            diagramType: {
              type: 'string',
              enum: ['flowchart', 'anatomy', 'concept-map', 'timeline'],
              description: 'Type of diagram to create (default: flowchart)'
            },
            focus: {
              type: 'string',
              description: 'Optional: specific aspect to visualize'
            }
          },
          required: ['content']
        }
      }
    ]

    const result = await queryWithFileSearch(
      cleanQuestion,
      undefined,
      additionalContext || undefined,
      toolDefinitions
    )

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
