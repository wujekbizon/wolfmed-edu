import { z } from 'zod'
import { ESSAY_DOCUMENT_CHARS, ESSAY_MAX_SECTIONS, ESSAY_MAX_WORDS } from '@/constants/essay'

export const EssayBriefSchema = z.object({
  course: z.enum(['pielegniarstwo', 'opiekun-medyczny'], { error: 'Wybierz kierunek.' }),
  kind: z.enum(['samoksztalcenie', 'referat', 'esej'], { error: 'Wybierz rodzaj pracy.' }),
  topic: z.string().trim().min(1, 'Podaj temat pracy.').max(300, 'Temat może mieć do 300 znaków.'),
  requirements: z.string().max(4000, 'Wpisz do 4000 znaków.'),
  additional: z.string().max(2000, 'Wpisz do 2000 znaków.'),
  materialIds: z.array(z.uuid()).max(10, 'Wybierz do 10 materiałów.'),
})
const SectionSchema = z.object({
  id: z.string().min(1).max(80),
  title: z.string().trim().min(1, 'Podaj tytuł części.').max(300),
  description: z.string().max(1000),
  words: z.number().int().min(0).max(ESSAY_MAX_WORDS),
})
export const EssaySectionsSchema = z.array(SectionSchema).max(ESSAY_MAX_SECTIONS, 'Plan może zawierać do 8 części.')
  .refine((sections) => new Set(sections.map((section) => section.id)).size === sections.length, 'Części muszą mieć różne identyfikatory.')
export const EssaySourcesSchema = z.array(z.object({
  label: z.string().max(500), origin: z.enum(['corpus', 'note', 'material']),
})).max(100)
export const EssayDraftSchema = z.object({
  schemaVersion: z.literal(1),
  brief: EssayBriefSchema.extend({ course: z.string().max(80), topic: z.string().max(300) }),
  sections: EssaySectionsSchema,
  targetWords: z.number().int().min(0).max(ESSAY_MAX_WORDS),
  outlineBrief: z.string().max(12_000),
  materialFingerprint: z.string().max(64),
  editorContent: z.string().max(ESSAY_DOCUMENT_CHARS),
  documentId: z.string().max(80),
  documentTopic: z.string().max(300),
  outlineSources: EssaySourcesSchema,
  sources: EssaySourcesSchema,
  gaps: z.array(z.string().max(1000)).max(20),
})
export const EssayGenerationSchema = EssayDraftSchema.extend({
  brief: EssayBriefSchema,
  sections: EssaySectionsSchema.refine((sections) => sections.length > 0, 'Najpierw przygotuj plan.'),
})
export const EssayDownloadSchema = z.object({
  topic: z.string().trim().min(1).max(300),
  editorContent: z.string().min(1, 'Najpierw przygotuj treść pracy.').max(ESSAY_DOCUMENT_CHARS),
  sources: EssaySourcesSchema,
})
export const EssayMaterialPreparationSchema = z.object({ course: EssayBriefSchema.shape.course, materialId: z.uuid() })
