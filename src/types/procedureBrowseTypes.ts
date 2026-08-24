import type { Procedure } from '@/types/dataTypes'
import type { PielegniastwoProcedure } from '@/types/pielegniastwoTypes'

export type ProcedureCourse = 'opiekun-medyczny' | 'pielegniarstwo'
export type ProcedureBrowseSortKey = 'default' | 'name-asc' | 'name-desc'

export type ProcedureBrowseCriteria = {
  search: string
  sort: ProcedureBrowseSortKey
}

type ProcedureBrowseItemBase = {
  key: string
  name: string
  searchValues: string[]
}

export type OpiekunProcedureBrowseItem = ProcedureBrowseItemBase & {
  course: 'opiekun-medyczny'
  data: Procedure
}

export type PielegniastwoProcedureBrowseItem = ProcedureBrowseItemBase & {
  course: 'pielegniarstwo'
  data: PielegniastwoProcedure
}

export type ProcedureBrowseItem =
  | OpiekunProcedureBrowseItem
  | PielegniastwoProcedureBrowseItem

export type CourseProceduresPageProps = {
  params: Promise<{ course: string }>
}
