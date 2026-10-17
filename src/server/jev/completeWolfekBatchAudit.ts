import 'server-only'
import { sql } from 'drizzle-orm'
import { db } from '@/server/db/index'
import { jevAuditLogs } from '@/server/db/schema'
import type { WolfekBatchRequest, WolfekBatchState } from '@/types/wolfekBatchTypes'

export async function completeWolfekBatchAudit(input: WolfekBatchRequest, userId: string | null, result: WolfekBatchState, elapsedMs: number) {
  try {
    const metadata = JSON.stringify({ status: result.status, message: result.message, visitId: input.visitId,
      batchId: result.batch?.id ?? null, states: result.batch?.states ?? null, actionLatencyMs: elapsedMs })
    await db.execute(sql`UPDATE ${jevAuditLogs} SET response_payload =
      jsonb_set(COALESCE(response_payload, '{}'::jsonb), '{wolfekBatch}', ${metadata}::jsonb)
      WHERE route = ${input.route} AND user_id IS NOT DISTINCT FROM ${userId}
      AND request_payload #>> '{state,submission,id}' = ${input.submissionId}`)
  } catch { console.error('Wolfek batch log write failed', { route: input.route }) }
}
