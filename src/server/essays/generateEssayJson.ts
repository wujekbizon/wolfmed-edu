import 'server-only'
import { z } from 'zod'
import { getGoogleAI } from '@/server/vertex-rag/client'
import { getModelTokenUsage } from '@/helpers/getModelTokenUsage'
import { ESSAY_MODEL, ESSAY_OUTPUT_TOKENS } from '@/constants/essay'
import { ESSAY_SYSTEM_PROMPT } from '@/constants/essayPrompts'

export async function generateEssayJson<T>(schema: z.ZodType<T>, prompt: string, signal: AbortSignal): Promise<T> {
  const schemaText = JSON.stringify(z.toJSONSchema(schema))
  let feedback = ''
  for (let attempt = 0; attempt < 2; attempt++) {
    const response = await getGoogleAI().models.generateContent({
      model: ESSAY_MODEL,
      contents: `${prompt}\n\nSCHEMAT JSON:\n${schemaText}\n${feedback}`,
      config: {
        systemInstruction: ESSAY_SYSTEM_PROMPT,
        responseMimeType: 'application/json',
        thinkingConfig: { thinkingBudget: 0 },
        temperature: 0.2,
        maxOutputTokens: ESSAY_OUTPUT_TOKENS,
        abortSignal: signal,
      },
    }).catch((error: unknown) => {
      console.error('[essay] generation failed', error)
      throw new Error(signal.aborted ? 'Generowanie trwało zbyt długo. Spróbuj ponownie.' : 'Generowanie jest chwilowo niedostępne. Spróbuj ponownie później.')
    })
    console.info('[essay] model usage', getModelTokenUsage(response.usageMetadata))
    if (response.candidates?.[0]?.finishReason === 'MAX_TOKENS') {
      throw new Error('Praca przekracza limit odpowiedzi. Zawęź temat lub skróć plan.')
    }
    try {
      return schema.parse(JSON.parse(response.text ?? ''))
    } catch {
      feedback = 'Popraw strukturę odpowiedzi zgodnie ze schematem. Zwróć wszystkie wymagane pola.'
    }
  }
  throw new Error('Nie udało się odczytać odpowiedzi. Spróbuj ponownie.')
}
