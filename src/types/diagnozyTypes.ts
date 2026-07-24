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
