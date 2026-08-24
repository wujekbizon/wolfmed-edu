import { getPielegniastwoSlug } from '@/lib/pielegniastwoUtils'
import type { PielegniastwoProcedure } from '@/types/pielegniastwoTypes'
import type { PielegniastwoProcedureBrowseItem } from '@/types/procedureBrowseTypes'

export function toPielegniastwoProcedureBrowseItems(
  procedures: PielegniastwoProcedure[]
): PielegniastwoProcedureBrowseItem[] {
  return procedures.map((procedure) => ({
    key: getPielegniastwoSlug(procedure),
    course: 'pielegniarstwo',
    name: procedure.name,
    searchValues: [
      procedure.name,
      procedure.meta.category,
      procedure.executionTime,
      procedure.notes,
      ...procedure.sections.flatMap((section) => [
        section.title,
        ...section.steps.map((item) => item.step),
      ]),
    ].filter((value): value is string => typeof value === 'string'),
    data: procedure,
  }))
}
