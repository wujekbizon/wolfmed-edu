import { ApiError, type GenerateContentConfig } from '@google/genai'
import { buildSystemPrompt } from '@/lib/mindmap/prompts'
import { MINDMAP_MODEL, MINDMAP_MAX_OUTPUT_TOKENS } from '@/constants/mindmapGeneration'
import { MINDMAP_RESPONSE_SCHEMA } from '@/constants/mindmapResponseSchema'
import type { MindMapGenerateResponse, MindMapModelGenerate } from '@/types/mindmapGenerationTypes'

export function createMindMapModelGenerator(
  generate: MindMapModelGenerate,
  signal: AbortSignal
): MindMapGenerateResponse {
  let useSchema = true
  const config: GenerateContentConfig = {
    systemInstruction: buildSystemPrompt(),
    responseMimeType: 'application/json',
    temperature: 0.4,
    thinkingConfig: { thinkingBudget: 0 },
    maxOutputTokens: MINDMAP_MAX_OUTPUT_TOKENS,
    abortSignal: signal,
  }
  return async (contents) => {
    try {
      const response = await generate({
        model: MINDMAP_MODEL,
        contents,
        config: { ...config, ...(useSchema ? { responseSchema: MINDMAP_RESPONSE_SCHEMA } : {}) },
      })
      return response.text
    } catch (error) {
      if (!useSchema || !(error instanceof ApiError) || error.status !== 400 || signal.aborted) {
        throw error
      }
      // Vertex can reject otherwise valid response schemas; Zod still checks JSON mode output.
      useSchema = false
      console.warn('[mindmap] Structured request rejected; using validated JSON mode')
      const response = await generate({ model: MINDMAP_MODEL, contents, config })
      return response.text
    }
  }
}
