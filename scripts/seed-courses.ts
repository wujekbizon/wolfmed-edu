/**
 * Seed the wolfmed_courses table with the active courses.
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
  await sql`
    INSERT INTO wolfmed_courses (slug, name, description, is_active)
    VALUES
      ('opiekun-medyczny', 'Opiekun Medyczny', 'Program edukacyjny dla opiekunów medycznych', true),
      ('pielegniarstwo', 'Pielęgniarstwo', 'Program edukacyjny dla kierunku pielęgniarstwo', true),
      ('angielski-medyczny', 'Angielski Medyczny', 'Kurs języka angielskiego medycznego na poziomie A2', true)
    ON CONFLICT (slug) DO UPDATE SET
      name = excluded.name,
      description = excluded.description,
      is_active = excluded.is_active
  `

  console.log('Seeded wolfmed_courses:')
  console.log('  ✓ opiekun-medyczny')
  console.log('  ✓ pielegniarstwo')
  console.log('  ✓ angielski-medyczny')

  await sql.end()
}

seedCourses().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
