'use server'

import { auth } from '@clerk/nextjs/server'
import { fromErrorToFormState, toFormState } from '@/helpers/toFormState'
import { FormState } from '@/types/actionTypes'
import { checkRateLimit } from '@/lib/rateLimit'
import { RagQuerySchema } from '@/server/schema'
import { queryWithFileSearch } from '@/server/google-rag'
import { parseMcpCommands } from '@/helpers/parse-mcp-commands'

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
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
        const resourceResults = await Promise.all(
          resources.map(async (filename) => {
            const response = await fetch(`${baseUrl}/api/mcp`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ tool: 'read', args: { filename } }),
            })
            const data = await response.json()
            return data.content?.[0]?.text || ''
          })
        )
        additionalContext = `Context from files:\n${resourceResults.join('\n\n')}`
      } catch (error) {
        console.error('Failed to fetch resources:', error)
      }
    }

    const mcpTools = tools.length > 0 ? tools.map(toolName => {
      switch (toolName) {
        case 'utworz':
          return {
            name: 'utworz_test',
            description: 'Generate test questions in Wolfmed JSON format based on the context',
            parameters: {
              type: 'object',
              properties: {
                questionCount: { type: 'number', description: 'Number of questions to generate' },
                difficulty: { type: 'string', enum: ['easy', 'medium', 'hard'], description: 'Difficulty level' }
              },
              required: ['questionCount']
            }
          }
        case 'podsumuj':
          return {
            name: 'podsumuj',
            description: 'Summarize the answer in 50-100 words',
            parameters: { type: 'object', properties: {} }
          }
        case 'flashcards':
          return {
            name: 'flashcards',
            description: 'Generate flashcards in Q&A format',
            parameters: {
              type: 'object',
              properties: {
                count: { type: 'number', description: 'Number of flashcards' }
              }
            }
          }
        case 'quiz':
          return {
            name: 'quiz',
            description: 'Generate a quick 3-question quiz',
            parameters: { type: 'object', properties: {} }
          }
        case 'tlumacz':
          return {
            name: 'tlumacz',
            description: 'Translate the answer to English',
            parameters: { type: 'object', properties: {} }
          }
        default:
          return null
      }
    }).filter(Boolean) as Array<{ name: string; description: string; parameters: any }> : undefined

    const result = await queryWithFileSearch(
      cleanQuestion,
      undefined,
      additionalContext || undefined,
      mcpTools
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
