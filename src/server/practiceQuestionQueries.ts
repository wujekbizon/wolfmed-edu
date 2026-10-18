import 'server-only'

import { and, eq, inArray, sql } from 'drizzle-orm'
import { db } from '@/server/db/index'
import { tests, userCustomCategories, userCustomTests } from '@/server/db/schema'
import type { Test } from '@/types/dataTypes'

export async function getPracticeQuestionIds(userId: string, category: string, count: number, sessionId: string) {
  const custom = category.startsWith('moje-testy__')
  const source = custom ? userCustomTests : tests
  const ownedQuestionIds = db.select({
    id: sql<string>`jsonb_array_elements_text(${userCustomCategories.questionIds})::uuid`,
  }).from(userCustomCategories).where(and(
    eq(userCustomCategories.userId, userId),
    eq(userCustomCategories.id, category.slice('moje-testy__'.length))
  ))
  const predicate = custom
    ? and(eq(userCustomTests.userId, userId), inArray(userCustomTests.id, ownedQuestionIds))
    : sql`${tests.meta}->>'category' = ${category}`
  return db.select({ id: source.id }).from(source).where(predicate)
    .orderBy(sql`md5(${source.id}::text || ${sessionId})`, source.id).limit(count)
}

export async function getPracticeQuestionsByIds(userId: string, category: string, questionIds: string[]) {
  if (!questionIds.length) return []
  const custom = category.startsWith('moje-testy__')
  const source = custom ? userCustomTests : tests
  const predicate = custom
    ? eq(userCustomTests.userId, userId)
    : sql`${tests.meta}->>'category' = ${category}`
  return await db.select({ id: source.id, data: source.data, meta: source.meta })
    .from(source).where(and(inArray(source.id, questionIds), predicate)) as Test[]
}
