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
  definicjaSnippet: string
}

export const DIAGNOZY_SORT_KEYS = [
  'section-asc',
  'section-desc',
  'title-asc',
  'title-desc',
  'todo-first',
] as const

export type DiagnozySortKey = (typeof DIAGNOZY_SORT_KEYS)[number]

export type DiagnozyStatusFilter = 'all' | 'done' | 'todo'

export type DiagnozyBrowseCriteria = {
  search: string
  chapter: string // '' = all
  status: DiagnozyStatusFilter
  sort: DiagnozySortKey
}

export type DiagnozyChapter = {
  number: string
  title: string
  diagnozy: DiagnozaListItem[]
}

export type DiagnozyChapterOption = {
  number: string
  title: string
}

export type DiagnozyExamAttempt = {
  id: string
  diagnozaSlug: string
  score: number
  passed: boolean
  timeSpent: number
  completedAt: Date
}

export type DiagnozaTitleRow = {
  slug: string
  section: string
  title: string
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

export type DiagnozyExamAnswerField = 'diagnoza' | 'cele' | 'interwencje' | 'ocena'

/** Result steps also include 'wykonanie' — mannequin execution (Egzamin v2). */
export type DiagnozyExamField = DiagnozyExamAnswerField | 'wykonanie'

export type DiagnozyExamStep = {
  field: DiagnozyExamAnswerField
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

export type DiagnozyExamAnswers = Record<DiagnozyExamAnswerField, string[]>

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

// ── Egzamin v2: mannequin body zones ────────────────────────────────────────

export const BODY_ZONES = [
  'glowa',
  'oczy',
  'uszy',
  'usta-drogi-oddechowe',
  'klatka-piersiowa',
  'brzuch',
  'miednica',
  'konczyny-gorne',
  'konczyny-dolne',
  'plecy',
  'skora',
  'cale-cialo',
] as const

export type BodyZone = (typeof BODY_ZONES)[number]

export const BODY_ZONE_LABELS: Record<BodyZone, string> = {
  glowa: 'Głowa',
  oczy: 'Oczy',
  uszy: 'Uszy',
  'usta-drogi-oddechowe': 'Usta / drogi oddechowe',
  'klatka-piersiowa': 'Klatka piersiowa',
  brzuch: 'Brzuch',
  miednica: 'Miednica / krocze',
  'konczyny-gorne': 'Kończyny górne',
  'konczyny-dolne': 'Kończyny dolne',
  plecy: 'Plecy / okolica krzyżowa',
  skora: 'Skóra (całościowo)',
  'cale-cialo': 'Całe ciało',
}

/** Regions selectable only via the button rail (no distinct point on the body). */
export const BUTTON_ONLY_ZONES: BodyZone[] = ['skora', 'cale-cialo']

/** intervention text → body zone the student assigned on the mannequin */
export type BodyZoneAssignments = Record<string, BodyZone>
