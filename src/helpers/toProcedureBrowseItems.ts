import 'server-only'
import { getProcedureSlugFromId } from '@/constants/procedureSlugs'
import { getPielegniastwoSlug } from '@/lib/pielegniastwoUtils'
import type { Procedure } from '@/types/dataTypes'
import type { PielegniastwoProcedure } from '@/types/pielegniastwoTypes'
import type {
  ProcedureBrowseItem,
  ProcedureCourse,
  ProcedureDatabaseRow,
} from '@/types/procedureBrowseTypes'

export function toProcedureBrowseItems(
  rows: ProcedureDatabaseRow[],
  course: ProcedureCourse
): ProcedureBrowseItem[] {
  return rows.map((row) => {
    const updatedAt = (row.updatedAt ?? row.createdAt)?.toISOString() ?? ''

    if (course === 'opiekun-medyczny') {
      return {
        id: row.id,
        slug: row.slug || getProcedureSlugFromId(row.id) || row.id,
        updatedAt,
        course,
        data: row.data as Procedure['data'],
      }
    }

    const data = row.data as PielegniastwoProcedure
    return {
      id: row.id,
      slug: row.slug || getPielegniastwoSlug(data),
      updatedAt,
      course,
      data,
    }
  })
}
