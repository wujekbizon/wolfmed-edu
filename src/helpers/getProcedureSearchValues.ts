import type { ProcedureBrowseItem } from '@/types/procedureBrowseTypes'

export function getProcedureSearchValues(procedure: ProcedureBrowseItem): string[] {
  if (procedure.course === 'opiekun-medyczny') {
    return [
      procedure.data.name,
      procedure.data.procedure,
      ...procedure.data.algorithm.map((item) => item.step),
    ]
  }

  return [
    procedure.data.name,
    procedure.data.meta.category,
    procedure.data.executionTime,
    procedure.data.notes,
    ...procedure.data.sections.flatMap((section) => [
      section.title,
      ...section.steps.map((item) => item.step),
    ]),
  ].filter((value): value is string => typeof value === 'string')
}
