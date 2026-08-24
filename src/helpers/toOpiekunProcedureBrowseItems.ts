import type { Procedure } from '@/types/dataTypes'
import type { OpiekunProcedureBrowseItem } from '@/types/procedureBrowseTypes'

export function toOpiekunProcedureBrowseItems(
  procedures: Procedure[]
): OpiekunProcedureBrowseItem[] {
  return procedures.map((procedure) => ({
    key: procedure.id,
    course: 'opiekun-medyczny',
    name: procedure.data.name,
    searchValues: [
      procedure.data.name,
      procedure.data.procedure,
      ...procedure.data.algorithm.map((item) => item.step),
    ],
    data: procedure,
  }))
}
