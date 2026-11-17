import type { EssayDraft } from '@/types/essayTypes'

export const ESSAY_COURSES = [
  { value: 'pielegniarstwo', label: 'Pielęgniarstwo' },
  { value: 'opiekun-medyczny', label: 'Opiekun medyczny' },
] as const
export const ESSAY_KINDS = [
  { value: 'samoksztalcenie', label: 'Praca samokształceniowa' },
  { value: 'referat', label: 'Referat' },
  { value: 'esej', label: 'Esej' },
]
export const ESSAY_TABS = [
  { id: 'brief', label: 'Wymagania' },
  { id: 'plan', label: 'Plan' },
  { id: 'text', label: 'Treść' },
] as const
export const ESSAY_MAX_WORDS = 3000
export const ESSAY_MAX_SECTIONS = 8
export const ESSAY_CONTEXT_CHARS = 200_000
export const ESSAY_DOCUMENT_CHARS = 250_000
export const ESSAY_PDF_BYTES = 1024 * 1024
export const ESSAY_TIMEOUT_MS = 150_000
export const ESSAY_MODEL = 'gemini-3.5-flash-lite'
export const ESSAY_OUTPUT_TOKENS = 16_000
export const ESSAY_MATERIAL_STALE_TIME = 30_000
export const ESSAY_MATERIAL_QUERY = 'essay-materials'
export const EMPTY_ESSAY: EssayDraft = {
  schemaVersion: 1,
  brief: { course: '', kind: 'samoksztalcenie', topic: '', requirements: '', additional: '', materialIds: [] },
  sections: [], targetWords: 0, outlineBrief: '', materialFingerprint: '',
  editorContent: '', documentId: '', documentTopic: '', outlineSources: [], sources: [], gaps: [],
}
