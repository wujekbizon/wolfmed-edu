import 'server-only'
import { db } from '@/server/db/index'
import { eq } from 'drizzle-orm'
import { ExtendedCompletedTest, ExtendedTest } from '@/types/dataTypes'

export async function getAllTests(): Promise<ExtendedTest[]> {
  const tests = await db.query.tests.findMany({
    orderBy: (model, { desc }) => desc(model.id),
  })

  return tests
}

export async function getCompletedTestsByUser(userId: string): Promise<ExtendedCompletedTest[]> {
  const completedTest = await db.query.completedTestes.findMany({
    where: (model, { eq }) => eq(model.userId, userId),
    orderBy: (model, { desc }) => desc(model.completedAt),
  })

  return completedTest
}
