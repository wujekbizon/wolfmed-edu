/**
 * scripts/seed-pielegniarstwo-tests.ts
 *
 * One-time script to populate wolfmed_tests with pielegniarstwo tests
 * from data/tests.json (sourced from new-courses branch).
 *
 * Usage:
 *   npx tsx scripts/seed-pielegniarstwo-tests.ts
 *
 * Safe to re-run — uses ON CONFLICT DO NOTHING on id.
 */

import 'dotenv/config'
import { neon } from '@neondatabase/serverless'
import * as fs from 'fs'
import * as path from 'path'

interface TestRecord {
  id: string
  meta: {
    course: string
    category: string
  }
  data: {
    question: string
    answers: Array<{ option: string; isCorrect: boolean }>
  }
  createdAt?: string | null
  updatedAt?: string | null
}

const BATCH_SIZE = 100

async function main() {
  const dbUrl = process.env.NEON_DATABASE_URL
  if (!dbUrl) throw new Error('NEON_DATABASE_URL is not set')

  const sql = neon(dbUrl)

  const testsPath = path.join(process.cwd(), 'data', 'tests.json')
  if (!fs.existsSync(testsPath)) {
    throw new Error(`tests.json not found at ${testsPath} — copy it from new-courses branch first`)
  }

  const allTests: TestRecord[] = JSON.parse(fs.readFileSync(testsPath, 'utf-8'))

  // Filter pielegniarstwo only, normalize typo 'pielegniarstvo' → 'pielegniarstwo'
  const pielTests = allTests
    .filter(t => ['pielegniarstwo', 'pielegniarstvo'].includes(t.meta?.course))
    .map(t => ({
      ...t,
      meta: {
        ...t.meta,
        course: 'pielegniarstwo',
      },
    }))

  console.log(`Found ${pielTests.length} pielegniarstwo tests to seed`)

  const categories: Record<string, number> = {}
  for (const t of pielTests) {
    categories[t.meta.category] = (categories[t.meta.category] || 0) + 1
  }
  console.log('Categories:', categories)

  let inserted = 0
  let skipped = 0

  for (let i = 0; i < pielTests.length; i += BATCH_SIZE) {
    const batch = pielTests.slice(i, i + BATCH_SIZE)

    for (const t of batch) {
      const result = await sql`
        INSERT INTO wolfmed_tests (id, meta, data, "createdAt", "updatedAt")
        VALUES (
          ${t.id}::uuid,
          ${JSON.stringify(t.meta)}::jsonb,
          ${JSON.stringify(t.data)}::jsonb,
          ${t.createdAt ?? new Date().toISOString()},
          ${t.updatedAt ?? null}
        )
        ON CONFLICT (id) DO NOTHING
        RETURNING id
      `
      if (result.length > 0) {
        inserted++
      } else {
        skipped++
      }
    }

    console.log(`Progress: ${Math.min(i + BATCH_SIZE, pielTests.length)}/${pielTests.length}`)
  }

  console.log(`\nDone. ✓ Inserted: ${inserted}  ⏭ Skipped (already exist): ${skipped}`)
}

main().catch(err => {
  console.error('Fatal error:', err)
  process.exit(1)
})
