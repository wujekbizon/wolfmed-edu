import 'server-only'
import { sql } from 'drizzle-orm'
import { db } from '@/server/db/index'
import { jevAuditLogs } from '@/server/db/schema'
import type { WolfekQuestionRequest, WolfekQuestionState } from '@/types/wolfekResponseTypes'

export async function recordWolfekBatchDelivery(
  input: WolfekQuestionRequest, userId: string | null, batchSubmissionId: string,
  result: WolfekQuestionState, reused: boolean,
) {
  try {
    const delivery = JSON.stringify([{ id: input.submissionId, preparedQuestionId: input.preparedQuestionId,
      question: input.question, answer: result.answer, status: result.status, reused, createdAt: new Date().toISOString() }])
    await db.execute(sql`UPDATE ${jevAuditLogs} SET response_payload =
      jsonb_set(COALESCE(response_payload, '{}'::jsonb), '{wolfekDeliveries}',
        COALESCE(response_payload->'wolfekDeliveries', '[]'::jsonb) || ${delivery}::jsonb)
      WHERE route = ${input.route} AND user_id IS NOT DISTINCT FROM ${userId}
      AND request_payload #>> '{state,submission,id}' = ${batchSubmissionId}`)
  } catch { console.error('Wolfek batch delivery write failed', { route: input.route }) }
}
