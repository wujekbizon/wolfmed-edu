/**
 * scripts/seed-all-tests.ts
 *
 * ⚠️  DESTRUCTIVE — truncates wolfmed_tests then re-inserts everything from data/tests.json
 *
 * Usage:
 *   npx tsx scripts/seed-all-tests.ts
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

function normalizeDate(val: string | null | undefined): string | null {
  if (!val) return null
  if (/^\d{4}-0-/.test(val)) return null
  const normalized = val.replace(' ', 'T').replace(/(\.\d{3})\d*$/, '$1')
  const d = new Date(normalized)
  return isNaN(d.getTime()) ? null : d.toISOString()
}

async function main() {
  const dbUrl = process.env.NEON_DATABASE_URL
  if (!dbUrl) throw new Error('NEON_DATABASE_URL is not set')

  const sql = neon(dbUrl)

  const filePath = path.join(process.cwd(), 'data', 'tests.json')
  if (!fs.existsSync(filePath)) {
    throw new Error(`tests.json not found at ${filePath}`)
  }

  const allTests: TestRecord[] = JSON.parse(fs.readFileSync(filePath, 'utf-8'))

  // Normalize pielegniarstvo typo
  const tests = allTests.map(t => ({
    ...t,
    meta: {
      ...t.meta,
      course: t.meta.course === 'pielegniarstvo' ? 'pielegniarstwo' : t.meta.course,
    },
  }))

  const summary: Record<string, number> = {}
  for (const t of tests) {
    const key = `${t.meta.course}/${t.meta.category}`
    summary[key] = (summary[key] || 0) + 1
  }
  console.log(`Total tests to insert: ${tests.length}`)
  console.log('Breakdown:', summary)

  console.log('\n⚠️  Truncating wolfmed_tests...')
  await sql`TRUNCATE TABLE wolfmed_tests`
  console.log('✓ Table cleared')

  let inserted = 0

  for (let i = 0; i < tests.length; i += BATCH_SIZE) {
    const batch = tests.slice(i, i + BATCH_SIZE)

    for (const t of batch) {
      const createdAt = normalizeDate(t.createdAt) ?? new Date().toISOString()
      const updatedAt = normalizeDate(t.updatedAt)

      await sql`
        INSERT INTO wolfmed_tests (id, meta, data, "createdAt", "updatedAt")
        VALUES (
          ${t.id}::uuid,
          ${JSON.stringify(t.meta)}::jsonb,
          ${JSON.stringify(t.data)}::jsonb,
          ${createdAt},
          ${updatedAt}
        )
      `
      inserted++
    }

    console.log(`Progress: ${Math.min(i + BATCH_SIZE, tests.length)}/${tests.length}`)
  }

  console.log(`\nDone. ✓ Inserted: ${inserted}`)
}

main().catch(err => {
  console.error('Fatal error:', err)
  process.exit(1)
})
