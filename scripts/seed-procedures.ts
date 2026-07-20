/**
 * scripts/seed-procedures.ts
 *
 * Repopulates wolfmed_procedures from data/procedures.json (both courses,
 * with course + slug baked into each record). Replaces the table contents:
 * ids are preserved from the JSON, so challenge completions and URLs keep
 * pointing at the same procedures.
 *
 * Usage:
 *   npx tsx scripts/seed-procedures.ts
 *
 * Requires NEON_DATABASE_URL in .env.local (or .env).
 */

import * as dotenv from 'dotenv'
import { neon } from '@neondatabase/serverless'
import * as fs from 'fs'
import * as path from 'path'

dotenv.config({ path: '.env.local' })
dotenv.config()

interface ProcedureRecord {
  id: string
  slug: string
  data: { meta?: { course?: string }; name?: string }
  createdAt?: string | null
  updatedAt?: string | null
}

function normalizeDate(val: string | null | undefined): string | null {
  if (!val) return null
  if (/^\d{4}-0-/.test(val)) return null
  const normalized = val.replace(' ', 'T').replace(/(\.\d{3})\d*$/, '$1')
  const d = new Date(normalized)
  return isNaN(d.getTime()) ? null : d.toISOString()
}

async function main() {
  const dbUrl = process.env.NEON_DATABASE_URL ?? process.env.DATABASE_URL
  if (!dbUrl) throw new Error('NEON_DATABASE_URL is not set')

  const sql = neon(dbUrl)

  const filePath = path.join(process.cwd(), 'data', 'procedures.json')
  if (!fs.existsSync(filePath)) {
    throw new Error(`procedures.json not found at ${filePath}`)
  }

  const procedures: ProcedureRecord[] = JSON.parse(
    fs.readFileSync(filePath, 'utf-8')
  )
  console.log(`Found ${procedures.length} procedures to seed`)

  for (const p of procedures) {
    if (!p.id || !p.slug || !p.data?.meta?.course) {
      throw new Error(
        `Record missing id/slug/meta.course: ${p.id ?? '?'} (${p.data?.name ?? '?'})`
      )
    }
  }

  console.log('Clearing wolfmed_procedures…')
  await sql`TRUNCATE TABLE wolfmed_procedures`

  let inserted = 0
  for (const p of procedures) {
    await sql`
      INSERT INTO wolfmed_procedures (id, course, slug, data, "createdAt", "updatedAt")
      VALUES (
        ${p.id}::uuid,
        ${p.data.meta!.course},
        ${p.slug},
        ${JSON.stringify(p.data)}::jsonb,
        ${normalizeDate(p.createdAt) ?? new Date().toISOString()},
        ${normalizeDate(p.updatedAt)}
      )
    `
    inserted++
  }

  const byCourse = await sql`
    SELECT course, count(*)::int AS count FROM wolfmed_procedures GROUP BY course ORDER BY course
  `
  console.log(`Inserted ${inserted} procedures:`)
  byCourse.forEach((row) => console.log(`  ${row.course}: ${row.count}`))
}

main().catch((err) => {
  console.error('Fatal error:', err)
  process.exit(1)
})
