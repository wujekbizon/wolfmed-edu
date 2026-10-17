export type JevAuditStatus = 'success' | 'http_error' | 'invalid_response' | 'timeout' | 'error'

export type JevAuditContext = {
  source: 'panel' | 'kierunki' | 'practice'
  route: string
  policyVersion: string
  userId?: string | null
  sessionId?: string | null
}

export type JevRequestPayload = {
  model: string
  state: unknown
  questions: Record<string, unknown>
}

export type JevAuditRecord = JevAuditContext & {
  requestPayload: JevRequestPayload
  responsePayload: unknown
  responseText: string | null
  status: JevAuditStatus
  httpStatus: number | null
  errorName: string | null
  errorMessage: string | null
  startedAt: Date
  latencyMs: number
}
