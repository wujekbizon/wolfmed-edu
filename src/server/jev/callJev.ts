import 'server-only'
import { JEV_ENDPOINT, JEV_TIMEOUT_MS } from '@/constants/jev'
import { JEV_MAX_RESPONSE_LENGTH } from '@/constants/jevAudit'
import { writeJevAuditLog } from './writeJevAuditLog'
import type { JevAuditContext, JevAuditStatus, JevRequestPayload } from '@/types/jevAuditTypes'

export async function callJev<T>(
  apiKey: string, requestPayload: JevRequestPayload, context: JevAuditContext,
  parseResponse: (response: unknown) => T | null,
): Promise<T | null> {
  const startedAt = new Date()
  let responsePayload: unknown = null
  let responseText: string | null = null
  let httpStatus: number | null = null
  let status: JevAuditStatus = 'error'
  let errorName: string | null = null
  let errorMessage: string | null = null
  try {
    const response = await fetch(JEV_ENDPOINT, {
      method: 'POST', cache: 'no-store', redirect: 'error',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(JEV_TIMEOUT_MS),
      body: JSON.stringify(requestPayload),
    })
    httpStatus = response.status
    responseText = await response.text()
    let parsedJson = false
    if (responseText.length <= JEV_MAX_RESPONSE_LENGTH) {
      try { responsePayload = JSON.parse(responseText); parsedJson = true } catch {}
    }
    if (!response.ok) { status = 'http_error'; return null }
    if (!parsedJson) { status = 'invalid_response'; return null }
    const decision = parseResponse(responsePayload)
    status = decision === null ? 'invalid_response' : 'success'
    return decision
  } catch (error) {
    errorName = error instanceof Error ? error.name : 'UnknownError'
    errorMessage = error instanceof Error ? error.message.replaceAll(apiKey, '[redacted]') : 'Unknown failure'
    status = errorName === 'TimeoutError' || errorName === 'AbortError' ? 'timeout' : 'error'
    return null
  } finally {
    await writeJevAuditLog({
      ...context, requestPayload, responsePayload, responseText, httpStatus, status,
      errorName, errorMessage, startedAt, latencyMs: Date.now() - startedAt.getTime(),
    })
  }
}
