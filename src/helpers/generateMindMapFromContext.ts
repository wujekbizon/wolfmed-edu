import { ZodError } from 'zod'
import { buildUserPrompt } from '@/lib/mindmap/prompts'
import { parseMindMapGeneration } from '@/helpers/parseMindMapGeneration'
import { MINDMAP_INVALID_MESSAGE, MINDMAP_MAX_ATTEMPTS } from '@/constants/mindmapGeneration'
import type { MindMapGenerateResponse, MindMapGenerationResult } from '@/types/mindmapGenerationTypes'

export async function generateMindMapFromContext(
  topic: string,
  context: string,
  generate: MindMapGenerateResponse
): Promise<MindMapGenerationResult> {
  if (!context.trim()) return { status: 'no_source' }

  const base = buildUserPrompt(topic, context)
  let feedback = ''
  for (let attempt = 1; attempt <= MINDMAP_MAX_ATTEMPTS; attempt++) {
    const started = Date.now()
    const prompt = feedback ? `${base}\n\nPopraw błędy formatu: ${feedback}` : base
    const text = await generate(prompt)
    try {
      const result = parseMindMapGeneration(text ?? '')
      console.info('[mindmap] generation', { attempt, status: result.status, durationMs: Date.now() - started })
      return result
    } catch (error) {
      feedback = error instanceof ZodError
        ? error.issues.slice(0, 6).map((issue) => `${issue.path.join('.')}: ${issue.message}`).join('; ')
        : error instanceof Error ? error.message : 'Nieprawidłowa odpowiedź JSON.'
      feedback = feedback.slice(0, 1000)
      console.warn('[mindmap] invalid response', { attempt, issues: feedback, durationMs: Date.now() - started })
    }
  }
  throw new Error(MINDMAP_INVALID_MESSAGE)
}
