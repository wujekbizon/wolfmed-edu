/**
 * One-time migration: sync Clerk publicMetadata for all existing users.
 *
 * - Every user gets:          { ownedCourses: [] }
 * - Users with an enrollment get: { ownedCourses: ["opiekun-medyczny"] }
 *
 * Safe to re-run — always fetches current metadata before patching.
 *
 * Run with:
 *   npx tsx scripts/migrate-clerk-metadata.ts
 *
 * Requires in .env.local:
 *   DATABASE_URL=
 *   CLERK_SECRET_KEY=
 */

import 'dotenv/config'
import postgres from 'postgres'

const DATABASE_URL = process.env.DATABASE_URL
const CLERK_SECRET_KEY = process.env.CLERK_SECRET_KEY

if (!DATABASE_URL) {
  console.error('Error: DATABASE_URL is not set.')
  process.exit(1)
}

if (!CLERK_SECRET_KEY) {
  console.error('Error: CLERK_SECRET_KEY is not set.')
  process.exit(1)
}

const sql = postgres(DATABASE_URL, { ssl: 'require' })

async function getClerkUser(userId: string) {
  const res = await fetch(`https://api.clerk.com/v1/users/${userId}`, {
    headers: { Authorization: `Bearer ${CLERK_SECRET_KEY}` },
  })
  if (!res.ok) throw new Error(`Clerk getUser failed for ${userId}: ${res.status}`)
  return res.json()
}

async function updateClerkMetadata(userId: string, ownedCourses: string[]) {
  const res = await fetch(`https://api.clerk.com/v1/users/${userId}`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${CLERK_SECRET_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      public_metadata: { ownedCourses },
    }),
  })
  if (!res.ok) throw new Error(`Clerk updateUser failed for ${userId}: ${res.status}`)
}

async function migrateClerkMetadata() {
  // 1. Fetch all users from DB
  const allUsers = await sql<{ userId: string }[]>`
    SELECT "userId" FROM wolfmed_users
  `

  // 2. Fetch all enrolled userIds (opiekun-medyczny)
  const enrolled = await sql<{ userId: string }[]>`
    SELECT DISTINCT "userId" FROM wolfmed_course_enrollments
    WHERE course_slug = 'opiekun-medyczny' AND is_active = true
  `
  const enrolledSet = new Set(enrolled.map((r) => r.userId))

  console.log(`Total users: ${allUsers.length}`)
  console.log(`Enrolled in opiekun-medyczny: ${enrolledSet.size}`)
  console.log('---')

  let updated = 0
  let skipped = 0
  let failed = 0

  for (const { userId } of allUsers) {
    try {
      const clerkUser = await getClerkUser(userId)
      const currentMeta = clerkUser.public_metadata ?? {}
      const currentCourses: string[] = currentMeta.ownedCourses ?? []

      const ownedCourses = enrolledSet.has(userId)
        ? currentCourses.includes('opiekun-medyczny')
          ? currentCourses
          : [...currentCourses, 'opiekun-medyczny']
        : currentCourses.length > 0
          ? currentCourses // already has metadata, don't wipe it
          : []

      const alreadyCorrect =
        JSON.stringify(currentCourses.sort()) === JSON.stringify(ownedCourses.sort())

      if (alreadyCorrect) {
        console.log(`⏭  ${userId} — already correct, skipping`)
        skipped++
        continue
      }

      await updateClerkMetadata(userId, ownedCourses)
      console.log(`✓  ${userId} — ownedCourses: [${ownedCourses.join(', ')}]`)
      updated++
    } catch (err) {
      console.error(`✗  ${userId} — ${err}`)
      failed++
    }
  }

  console.log('---')
  console.log(`Done. Updated: ${updated} | Skipped: ${skipped} | Failed: ${failed}`)

  await sql.end()
}

migrateClerkMetadata().catch((err) => {
  console.error('Migration failed:', err)
  process.exit(1)
})
