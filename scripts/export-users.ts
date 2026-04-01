/**
 * Step 1: Export all users from DB into a local JSON file.
 *
 * Queries wolfmed_users and wolfmed_course_enrollments, then writes
 * scripts/users-export.json — inspect this file before running step 2.
 *
 * Run with:
 *   npx tsx scripts/export-users.ts
 *
 * Requires in .env.local:
 *   NEON_DATABASE_URL=
 */

import 'dotenv/config'
import postgres from 'postgres'
import fs from 'fs'
import path from 'path'

const DATABASE_URL = process.env.NEON_DATABASE_URL

if (!DATABASE_URL) {
  console.error('Error: NEON_DATABASE_URL is not set.')
  process.exit(1)
}

const sql = postgres(DATABASE_URL, { ssl: 'require' })

type UserExport = {
  userId: string
  ownedCourses: string[]
}

async function exportUsers() {
  const allUsers = await sql<{ userId: string }[]>`
    SELECT "userId" FROM wolfmed_users ORDER BY "userId"
  `

  const enrolled = await sql<{ userId: string }[]>`
    SELECT DISTINCT "userId" FROM wolfmed_course_enrollments
    WHERE course_slug = 'opiekun-medyczny' AND is_active = true
  `
  const enrolledSet = new Set(enrolled.map((r) => r.userId))

  const output: UserExport[] = allUsers.map(({ userId }) => ({
    userId,
    ownedCourses: enrolledSet.has(userId) ? ['opiekun-medyczny'] : [],
  }))

  const outPath = path.join(process.cwd(), 'scripts', 'users-export.json')
  fs.writeFileSync(outPath, JSON.stringify(output, null, 2))

  console.log(`Total users exported: ${output.length}`)
  console.log(`  With opiekun-medyczny: ${enrolled.length}`)
  console.log(`  Without courses:       ${output.length - enrolled.length}`)
  console.log(`---`)
  console.log(`Saved to: scripts/users-export.json`)
  console.log(`Review the file before running: npx tsx scripts/sync-clerk-metadata.ts`)

  await sql.end()
}

exportUsers().catch((err) => {
  console.error('Export failed:', err)
  process.exit(1)
})
