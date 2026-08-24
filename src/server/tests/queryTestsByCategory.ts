import 'server-only'
import { sql } from 'drizzle-orm'
import { db } from '@/server/db/index'
import type { ExtendedTest } from '@/types/dataTypes'

export async function queryTestsByCategory(category: string): Promise<ExtendedTest[]> {
  return db.query.tests.findMany({
    where: (model) => sql`${model.meta}->>'category' = ${category}`,
    orderBy: (model, { desc }) => desc(model.id),
  })
}
