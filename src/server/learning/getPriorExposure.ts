import 'server-only'
import { sql } from 'drizzle-orm'
import { learningPracticeItems, learningPracticeSessions } from '@/server/db/schema'
import type { PracticeTransaction } from '@/types/learningPracticeServerTypes'

export async function getPriorExposure(tx: PracticeTransaction, userId: string, category: string) {
  const result = await tx.execute<{ id: string; revision: string }>(sql`
    SELECT DISTINCT id, revision FROM (
      SELECT item->>'id' AS id, item->>'revision' AS revision
      FROM ${learningPracticeSessions} AS s, LATERAL jsonb_array_elements(s.items) AS item
      WHERE s."userId" = ${userId} AND s.category = ${category}
        AND (item->>'revealed' = 'true'
          OR item->>'priorExposure' = 'true'
          OR item->>'outcome' IN ('unassisted', 'assisted'))
      UNION
      SELECT p.item->>'id' AS id, p.item->>'revision' AS revision
      FROM ${learningPracticeItems} AS p
      JOIN ${learningPracticeSessions} AS s ON s.id = p."sessionId"
      WHERE s."userId" = ${userId} AND s.category = ${category}
        AND (p.item->>'revealed' = 'true'
          OR p.item->>'priorExposure' = 'true'
          OR p.item->>'outcome' IN ('unassisted', 'assisted'))
    ) exposures
  `)
  return new Set(result.rows.map((row) => `${row.id}:${row.revision}`))
}

