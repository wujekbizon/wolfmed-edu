import 'server-only'
import { sql } from 'drizzle-orm'
import { db } from '@/server/db/index'
import { jevAuditLogs } from '@/server/db/schema'
import type { WolfekQuestionRequest, WolfekQuestionState } from '@/types/wolfekResponseTypes'

export async function completeWolfekAudit(
  input: WolfekQuestionRequest, userId: string | null, result: WolfekQuestionState, elapsedMs: number,
) {
  try {
    const delivery = JSON.stringify({ origin: input.origin, preparedQuestionId: input.preparedQuestionId,
      submissionId: input.submissionId, status: result.status, answer: result.answer,
      message: result.message, actionLatencyMs: elapsedMs })
    await db.execute(sql`UPDATE ${jevAuditLogs} SET response_payload =
      jsonb_set(COALESCE(response_payload, '{}'::jsonb), '{wolfekDelivery}', ${delivery}::jsonb)
      WHERE route = ${input.route} AND user_id IS NOT DISTINCT FROM ${userId}
      AND request_payload #>> '{state,submission,id}' = ${input.submissionId}`)
  } catch { console.error('Wolfek delivery log write failed', { route: input.route }) }
}
