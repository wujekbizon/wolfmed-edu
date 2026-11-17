import { z } from 'zod'
import { ESSAY_MAX_SECTIONS, ESSAY_MAX_WORDS } from '@/constants/essay'

const EvidenceSchema = z.object({
  label: z.string().max(500), origin: z.enum(['corpus', 'material']),
  quote: z.string().min(20).max(1500),
})
const ResultFields = {
  status: z.enum(['ready', 'no_source']),
  gaps: z.array(z.string().min(1).max(1000)).max(20),
}
export const EssayOutlineResponse = z.object({
  ...ResultFields,
  targetWords: z.number().int().min(0).max(ESSAY_MAX_WORDS),
  sections: z.array(z.object({
    id: z.string().min(1).max(80), title: z.string().min(1).max(300),
    description: z.string().max(1000), words: z.number().int().min(0).max(ESSAY_MAX_WORDS),
  })).max(ESSAY_MAX_SECTIONS),
  evidence: z.array(EvidenceSchema).max(50),
})
export const EssayTextResponse = z.object({
  ...ResultFields,
  sections: z.array(z.object({
    id: z.string(), title: z.string().max(300),
    paragraphs: z.array(z.string().min(1).max(12_000)).min(1).max(30),
    evidence: z.array(EvidenceSchema).min(1).max(20),
  })).max(ESSAY_MAX_SECTIONS),
})
export const EssayReviewResponse = z.object({ supported: z.boolean(), gaps: z.array(z.string().max(1000)).max(20) })
