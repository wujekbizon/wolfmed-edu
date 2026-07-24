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

export const WYPELNIJ_STEPS = [
  'diagnoza',
  'cele',
  'interwencje',
  'ocena',
  'podsumowanie',
] as const

export type WypelnijStep = (typeof WYPELNIJ_STEPS)[number]

export type WypelnijOption = {
  text: string
  /** Revealed when the option is selected (uzasadnienie for interwencje). */
  detail?: string
}

export type WypelnijStepConfig = {
  key: Exclude<WypelnijStep, 'podsumowanie'>
  title: string
  prompt: string
  multi: boolean
  options: WypelnijOption[]
}
