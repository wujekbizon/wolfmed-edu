import type { JevAuditStatus } from './jevAuditTypes'
import type { WolfekAdminSummary, WolfekAdminDaily, WolfekAdminTopic, WolfekAdminModel,
  WolfekAdminRoute, WolfekAdminLifetime } from './wolfekAdminMetricTypes'
export type { WolfekAdminSummary, WolfekAdminDaily, WolfekAdminTopic, WolfekAdminModel,
  WolfekAdminRoute, WolfekAdminLifetime } from './wolfekAdminMetricTypes'

export type WolfekAdminView = 'insights' | 'audit' | 'errors' | 'usage'
export type WolfekAdminFilters = {
  view: WolfekAdminView
  source: 'all' | 'panel' | 'kierunki' | 'practice'
  status: 'all' | JevAuditStatus
  from: string
  to: string
  search: string
  page: number
}
export type WolfekAdminRow = {
  id: string
  createdAt: string
  source: string
  route: string
  model: string
  status: string
  kind: string
  question: string
  topic: string | null
  confidence: number | null
  latencyMs: number | null
  inputTokens: number | null
  outputTokens: number | null
  needsReview: boolean
}
export type WolfekAdminReport = {
  summary: WolfekAdminSummary
  daily: WolfekAdminDaily[]
  topics: WolfekAdminTopic[]
  models: WolfekAdminModel[]
  routes: WolfekAdminRoute[]
  lifetime: WolfekAdminLifetime
  rows: WolfekAdminRow[]
  totalRows: number
}
export type WolfekAdminPageProps = { searchParams: Promise<Record<string, string | string[] | undefined>> }
