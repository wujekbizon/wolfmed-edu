import 'server-only'
import { db } from '@/server/db/index'
import { ExtendedTest } from '@/types/dataTypes'

export async function getAllTests(): Promise<ExtendedTest[]> {
  const tests = await db.query.tests.findMany({
    orderBy: (model, { desc }) => desc(model.id),
  })

  return tests
}
