/**
 * Seed the wolfmed_courses table with the two active courses.
 * Run with: pnpm run db:seed
 *
 * Requires NEON_DATABASE_URL to be set in .env.local
 */

import 'dotenv/config'
import postgres from 'postgres'

const connectionString = process.env.NEON_DATABASE_URL

if (!connectionString) {
  console.error('Error: NEON_DATABASE_URL is not set.')
  process.exit(1)
}

const sql = postgres(connectionString, { ssl: 'require' })

async function seedCourses() {
  const existing = await sql`SELECT slug FROM wolfmed_courses`

  if (existing.length > 0) {
    console.log(`Courses table already has ${existing.length} row(s):`)
    existing.forEach((r) => console.log(`  - ${r.slug}`))
    console.log('Nothing to seed.')
    await sql.end()
    return
  }

  await sql`
    INSERT INTO wolfmed_courses (slug, name, description, is_active)
    VALUES
      ('opiekun-medyczny', 'Opiekun Medyczny', 'Program edukacyjny dla opiekunów medycznych', true),
      ('pielegniarstwo', 'Pielęgniarstwo', 'Program edukacyjny dla kierunku pielęgniarstwo', true)
  `

  console.log('Seeded wolfmed_courses:')
  console.log('  ✓ opiekun-medyczny')
  console.log('  ✓ pielegniarstwo')

  await sql.end()
}

seedCourses().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
