import 'server-only'
import { randomUUID } from 'node:crypto'
import { collectEssayContext } from './collectEssayContext'
import { generateEssayJson } from './generateEssayJson'
import { resolveEssayEvidence } from './resolveEssayEvidence'
import { EssayTextResponse, EssayReviewResponse } from './responseSchema'
import { formatContextChunks } from '@/helpers/formatContextChunks'
import { buildEssayDocument } from '@/helpers/buildEssayDocument'
import { ESSAY_MAX_WORDS, ESSAY_TIMEOUT_MS } from '@/constants/essay'
import { ESSAY_WRITE_TASK, ESSAY_REVIEW_TASK } from '@/constants/essayPrompts'
import type { EssayDraft } from '@/types/essayTypes'

export async function writeEssay(userId: string, draft: EssayDraft): Promise<EssayDraft> {
  if (draft.outlineBrief !== JSON.stringify(draft.brief)) throw new Error('Wymagania zmieniły się. Przygotuj ponownie plan.')
  if (draft.gaps.length) throw new Error('Uzupełnij materiały lub zmień wymagania i przygotuj ponownie plan.')
  const signal = AbortSignal.timeout(ESSAY_TIMEOUT_MS)
  const context = await collectEssayContext(userId, draft.brief, draft.sections.map((section) => `${draft.brief.topic} ${section.title}`))
  if (context.materialFingerprint !== draft.materialFingerprint) throw new Error('Wybrane materiały zmieniły się. Przygotuj ponownie plan.')
  if (!context.chunks.length) return { ...draft, gaps: ['Brakuje źródeł do przygotowania treści pracy.'] }
  const input = `WYMAGANIA:\n${JSON.stringify(draft.brief)}\nPLAN:\n${JSON.stringify(draft.sections)}\nMATERIAŁY:\n${formatContextChunks(context.chunks)}`
  const result = await generateEssayJson(EssayTextResponse, `${ESSAY_WRITE_TASK}\n${input}`, signal)
  if (result.status === 'no_source' || result.gaps.length) {
    return { ...draft, gaps: result.gaps.length ? result.gaps : ['Materiały nie wystarczają do napisania wszystkich części.'] }
  }
  if (result.sections.length !== draft.sections.length || result.sections.some((section, index) =>
    section.id !== draft.sections[index]?.id || section.title !== draft.sections[index]?.title)) {
    throw new Error('Odpowiedź nie odpowiada zatwierdzonemu planowi. Spróbuj ponownie.')
  }
  const words = result.sections.flatMap((section) => section.paragraphs).join(' ').trim().split(/\s+/).length
  if (words > ESSAY_MAX_WORDS) throw new Error('Praca przekracza limit długości. Skróć plan.')
  const sources = resolveEssayEvidence(context.chunks, result.sections.flatMap((section) => section.evidence))
  const review = await generateEssayJson(EssayReviewResponse,
    `${ESSAY_REVIEW_TASK}\n${input}\nPRACA:\n${JSON.stringify(result.sections)}`, signal)
  if (!review.supported || review.gaps.length) {
    return { ...draft, gaps: review.gaps.length ? review.gaps : ['Nie udało się potwierdzić całej treści w źródłach. Doprecyzuj plan lub dodaj materiały.'] }
  }
  return { ...draft, editorContent: buildEssayDocument(draft.brief.topic, result.sections), documentId: randomUUID(), documentTopic: draft.brief.topic, sources, gaps: [] }
}
