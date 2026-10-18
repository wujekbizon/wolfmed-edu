import 'server-only'

import { cache } from 'react'
import { count, sql } from 'drizzle-orm'
import { db } from '@/server/db/index'
import { tests } from '@/server/db/schema'

export const getTestCategoryCounts = cache(async () => {
  const category = sql<string>`${tests.meta}->>'category'`
  return db.select({
    category,
    course: sql<string>`min(${tests.meta}->>'course')`,
    count: count(),
  }).from(tests).groupBy(category).orderBy(category)
})
