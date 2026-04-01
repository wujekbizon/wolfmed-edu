/**
 * scripts/seed-procedures.ts
 *
 * One-time script to populate wolfmed_procedures from data/procedures.json.
 *
 * Usage:
 *   npx tsx scripts/seed-procedures.ts
 *
 * Safe to re-run — uses ON CONFLICT DO NOTHING on id.
 * Point NEON_DATABASE_URL to staging or production as needed.
 */

import 'dotenv/config'
import { neon } from '@neondatabase/serverless'
import * as fs from 'fs'
import * as path from 'path'

interface ProcedureRecord {
  id: string
  data: unknown
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
  const dbUrl = process.env.NEON_DATABASE_URL
  if (!dbUrl) throw new Error('NEON_DATABASE_URL is not set')

  const sql = neon(dbUrl)

  const filePath = path.join(process.cwd(), 'data', 'procedures.json')
  if (!fs.existsSync(filePath)) {
    throw new Error(`procedures.json not found at ${filePath}`)
  }

  const procedures: ProcedureRecord[] = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
  console.log(`Found ${procedures.length} procedures to seed`)

  let inserted = 0
  let skipped = 0

  for (const p of procedures) {
    const createdAt = normalizeDate(p.createdAt) ?? new Date().toISOString()
    const updatedAt = normalizeDate(p.updatedAt)

    const result = await sql`
      INSERT INTO wolfmed_procedures (id, data, "createdAt", "updatedAt")
      VALUES (
        ${p.id}::uuid,
        ${JSON.stringify(p.data)}::jsonb,
        ${createdAt},
        ${updatedAt}
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

  console.log(`\nDone. ✓ Inserted: ${inserted}  ⏭ Skipped (already exist): ${skipped}`)
}

main().catch(err => {
  console.error('Fatal error:', err)
  process.exit(1)
})
