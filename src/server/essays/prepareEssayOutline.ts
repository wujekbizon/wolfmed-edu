import 'server-only'
import { collectEssayContext } from './collectEssayContext'
import { generateEssayJson } from './generateEssayJson'
import { resolveEssayEvidence } from './resolveEssayEvidence'
import { EssayOutlineResponse } from './responseSchema'
import { EssaySectionsSchema } from './schema'
import { formatContextChunks } from '@/helpers/formatContextChunks'
import { EMPTY_ESSAY, ESSAY_TIMEOUT_MS } from '@/constants/essay'
import { ESSAY_OUTLINE_TASK } from '@/constants/essayPrompts'
import type { EssayBrief, EssayDraft } from '@/types/essayTypes'

export async function prepareEssayOutline(userId: string, brief: EssayBrief): Promise<EssayDraft> {
  const signal = AbortSignal.timeout(ESSAY_TIMEOUT_MS)
  const context = await collectEssayContext(userId, brief, [])
  const base = { ...structuredClone(EMPTY_ESSAY), brief, outlineBrief: JSON.stringify(brief), materialFingerprint: context.materialFingerprint }
  if (!context.chunks.length) return { ...base, gaps: ['Brakuje materiałów dotyczących tego tematu. Dodaj PDF lub TXT albo zmień temat pracy.'] }
  const result = await generateEssayJson(EssayOutlineResponse,
    `${ESSAY_OUTLINE_TASK}\nWYMAGANIA:\n${JSON.stringify(brief)}\nMATERIAŁY:\n${formatContextChunks(context.chunks)}`, signal)
  const parsed = EssaySectionsSchema.safeParse(result.sections)
  if (!parsed.success) throw new Error('Otrzymany plan ma nieprawidłową strukturę. Spróbuj ponownie.')
  const sections = parsed.data
  if (result.status === 'no_source' || result.gaps.length) {
    return { ...base, sections, targetWords: result.targetWords, gaps: result.gaps.length ? result.gaps : ['Materiały nie wystarczają do przygotowania całej pracy.'] }
  }
  if (!sections.length || !result.targetWords || sections.reduce((sum, section) => sum + section.words, 0) !== result.targetWords) {
    throw new Error('Plan ma nieprawidłową długość. Przygotuj go ponownie.')
  }
  return { ...base, sections, targetWords: result.targetWords, outlineSources: resolveEssayEvidence(context.chunks, result.evidence) }
}
