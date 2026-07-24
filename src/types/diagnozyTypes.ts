import { z } from 'zod'
import {
  DiagnozaSchema,
  DiagnozyFileSchema,
  StringListOrGroupedSchema,
} from '@/server/schema'

export type Diagnoza = z.infer<typeof DiagnozaSchema>
export type DiagnozyFile = z.infer<typeof DiagnozyFileSchema>
export type StringListOrGrouped = z.infer<typeof StringListOrGroupedSchema>

export type DiagnozaInterwencja = Diagnoza['interwencje'][number]

/** Row returned by getAllDiagnozy — list metadata without the jsonb payload. */
export type DiagnozaListItem = {
  id: string
  slug: string
  section: string
  chapterNumber: string
  chapterTitle: string
  title: string
  author: string | null
  difficulty: Diagnoza['difficulty'] | null
  definicjaSnippet: string
}

export type DiagnozyChapter = {
  number: string
  title: string
  diagnozy: DiagnozaListItem[]
}

/** Option for the "Diagnoza pielęgniarska" select — one per published diagnosis. */
export type DiagnozaFormulation = {
  slug: string
  text: string
}

/** Lists that populate the form once a diagnosis formulation is chosen. */
export type DiagnozaFillData = {
  celeOpieki: string[]
  interwencje: DiagnozaInterwencja[]
  oczekiwaneWyniki: string
}

// ── Egzamin mode ────────────────────────────────────────────────────────────

export type DiagnozyExamField = 'diagnoza' | 'cele' | 'interwencje' | 'ocena'

export type DiagnozyExamStep = {
  field: DiagnozyExamField
  label: string
  prompt: string
  multi: boolean
  /** Correct items + sibling distractors, shuffled server-side, no flags. */
  options: string[]
}

export type DiagnozyExamPayload = {
  slug: string
  caseText: string
  steps: DiagnozyExamStep[]
}

export type DiagnozyExamAnswers = Record<DiagnozyExamField, string[]>

export type DiagnozyExamStepResult = {
  field: DiagnozyExamField
  label: string
  hits: string[]
  missed: string[]
  extra: string[]
  scorePercent: number
}

export type DiagnozyExamResult = {
  score: number
  passed: boolean
  steps: DiagnozyExamStepResult[]
  /** Uzasadnienia of correct interventions — the teaching payload on reveal. */
  uzasadnienia: Record<string, string>
}
