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

    const { cleanQuestion, tools } = parseMcpCommands(validationResult.data.question)

    let additionalContext = ''
    if (tools.length > 0) {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
      const mcpResults = await Promise.all(
        tools.map(async (tool) => {
          const response = await fetch(`${baseUrl}/api/mcp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tool: tool.name, args: tool.args }),
          })
          const data = await response.json()
          return data.content?.[0]?.text || ''
        })
      )
      additionalContext = mcpResults.join('\n\n')
    }

    const finalQuestion = additionalContext
      ? `Context from documents:\n${additionalContext}\n\nQuestion: ${cleanQuestion}`
      : cleanQuestion

    const result = await queryWithFileSearch(finalQuestion)

    return {
      ...toFormState('SUCCESS', result.answer),
      values: { sources: result.sources }
    }
  } catch (error) {
    console.error('Error querying RAG:', error)
    return fromErrorToFormState(error)
  }
}
