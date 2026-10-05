import 'server-only'
import { and, eq, inArray, sql } from 'drizzle-orm'
import { db } from '@/server/db/index'
import { learningPracticeSessions, tests, users } from '@/server/db/schema'
import { PracticeQuestionDataSchema } from '@/server/schema'
import { getPracticeRevision } from '@/helpers/getPracticeRevision'
import { PRACTICE_CATALOG_VERSION, PRACTICE_POLICY_VERSION } from '@/constants/learningPractice'
import { buildPracticeView } from './buildView'
import { getPriorExposure } from './getPriorExposure'
import { getPracticeItems } from './getPracticeItems'
import { toPracticeBaseItem } from '@/helpers/toPracticeBaseItem'
import { PracticeError } from './PracticeError'
import type { PracticeItem } from '@/types/learningPracticeTypes'

export async function startPracticeSession(userId: string, category: string, startId: string, repeatSessionId?: string) {
  return db.transaction(async (tx) => {
    await tx.select({ id: users.id }).from(users).where(eq(users.userId, userId)).for('update')
    const [existing] = await tx.select().from(learningPracticeSessions).where(and(
      eq(learningPracticeSessions.userId, userId),
      eq(learningPracticeSessions.category, category),
      sql`(${learningPracticeSessions.id} = ${startId} OR ${learningPracticeSessions.status} = 'active')`,
    )).limit(1)
    if (existing?.policyVersion === PRACTICE_POLICY_VERSION) return buildPracticeView(tx, existing)
    if (existing) await tx.update(learningPracticeSessions).set({
      status: 'abandoned', finishedAt: new Date(), version: existing.version + 1,
    }).where(eq(learningPracticeSessions.id, existing.id))
    let repeatIds: string[] | undefined
    if (repeatSessionId) {
      const [previous] = await tx.select().from(learningPracticeSessions).where(and(
        eq(learningPracticeSessions.id, repeatSessionId), eq(learningPracticeSessions.userId, userId),
        eq(learningPracticeSessions.category, category),
      )).limit(1)
      if (!previous || previous.status === 'active') throw new PracticeError('Sesja do powtórki niedostępna.')
      repeatIds = (await getPracticeItems(tx, previous))
        .filter((item) => item.outcome !== 'unassisted').map((item) => item.id)
      if (!repeatIds.length) throw new PracticeError('Brak trudniejszych pytań do powtórki.')
    }
    const pool = await tx.select().from(tests)
      .where(and(sql`${tests.meta}->>'category' = ${category}`, repeatIds ? inArray(tests.id, repeatIds) : undefined))
      .orderBy(tests.id)
    const eligible: PracticeItem[] = []
    const priorExposure = await getPriorExposure(tx, userId, category)
    for (const row of pool) {
      const parsed = PracticeQuestionDataSchema.safeParse(row.data)
      if (!parsed.success) {
        console.warn('[practice] Question needs content review:', row.id)
        continue
      }
      const revision = getPracticeRevision(parsed.data)
      eligible.push({
        id: row.id, revision, attempts: [],
        hintOpened: false, revealed: false, version: 0, outcome: null,
        priorExposure: priorExposure.has(`${row.id}:${revision}`),
      })
    }
    if (!eligible.length) throw new PracticeError('Brak pytań do ćwiczenia. Przeglądanie pozostaje dostępne.')
    const [session] = await tx.insert(learningPracticeSessions).values({
      id: startId, userId, category, items: eligible.map(toPracticeBaseItem),
      policyVersion: PRACTICE_POLICY_VERSION, catalogVersion: PRACTICE_CATALOG_VERSION,
    }).returning()
    return buildPracticeView(tx, session!)
  })
}
