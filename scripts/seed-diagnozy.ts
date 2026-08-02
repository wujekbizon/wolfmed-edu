/**
 * scripts/seed-diagnozy.ts
 *
 * Repopulates wolfmed_diagnozy from data/diagnozy.json. Every record is
 * validated with DiagnozyFileSchema (Zod) BEFORE any write — a single invalid
 * diagnosis aborts the whole seed, so hand-authored or AI-generated content
 * can never reach the table unchecked. Replaces the table contents; ids are
 * preserved from the JSON so URLs and progress rows keep pointing at the
 * same diagnoses.
 *
 * Usage:
 *   npx tsx scripts/seed-diagnozy.ts
 *
 * Requires NEON_DATABASE_URL in .env.local (or .env).
 */

import * as dotenv from 'dotenv'
import { neon } from '@neondatabase/serverless'
import * as fs from 'fs'
import * as path from 'path'
import { DiagnozyFileSchema } from '../src/server/schema'

dotenv.config({ path: '.env.local' })
dotenv.config()

async function main() {
  const dbUrl = process.env.NEON_DATABASE_URL ?? process.env.DATABASE_URL
  if (!dbUrl) throw new Error('NEON_DATABASE_URL is not set')

  const sql = neon(dbUrl)

  const filePath = path.join(process.cwd(), 'data', 'diagnozy.json')
  if (!fs.existsSync(filePath)) {
    throw new Error(`diagnozy.json not found at ${filePath}`)
  }

  const raw = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
  const parsed = DiagnozyFileSchema.safeParse(raw)
  if (!parsed.success) {
    console.error('diagnozy.json failed schema validation:')
    for (const issue of parsed.error.issues) {
      console.error(`  ${issue.path.join('.')}: ${issue.message}`)
    }
    process.exit(1)
  }

  const { diagnozy } = parsed.data
  console.log(`Validated ${diagnozy.length} diagnozy`)

  const slugs = new Set<string>()
  for (const d of diagnozy) {
    if (slugs.has(d.slug)) throw new Error(`Duplicate slug: ${d.slug}`)
    slugs.add(d.slug)
  }

  console.log('Clearing wolfmed_diagnozy…')
  await sql`TRUNCATE TABLE wolfmed_diagnozy`

  let inserted = 0
  for (const d of diagnozy) {
    await sql`
      INSERT INTO wolfmed_diagnozy
        (id, course, slug, section, "chapterNumber", "chapterTitle", title, data, "createdAt")
      VALUES (
        ${d.id}::uuid,
        'pielegniarstwo',
        ${d.slug},
        ${d.section},
        ${d.chapter.number},
        ${d.chapter.title},
        ${d.title},
        ${JSON.stringify(d)}::jsonb,
        ${new Date().toISOString()}
      )
    `
    inserted++
  }

  const byChapter = await sql`
    SELECT "chapterNumber", count(*)::int AS count
    FROM wolfmed_diagnozy GROUP BY "chapterNumber" ORDER BY "chapterNumber"
  `
  console.log(`Inserted ${inserted} diagnozy:`)
  byChapter.forEach((row) => console.log(`  rozdział ${row.chapterNumber}: ${row.count}`))
}

main().catch((err) => {
  console.error('Fatal error:', err)
  process.exit(1)
})
