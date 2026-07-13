/**
 * Seed the default memory policies (answer_grounding, medical_disclaimer,
 * answer_language). Run with: pnpm run db:memory:seed
 *
 * Standalone (raw SQL via `postgres`, matching scripts/seed-courses.ts) so it
 * needs no `@/` alias resolution. Idempotent — only inserts policy keys that
 * have no active version yet. Requires the wolfmed_mem_* tables to exist
 * (run db:memory:extensions + db:push first) and NEON_DATABASE_URL to be set.
 */

import 'dotenv/config'
import postgres from 'postgres'
import { DEFAULT_POLICIES } from '../src/constants/memoryPolicies'
import { TENANT_ID } from '../src/server/memory/config'

const connectionString = process.env.NEON_DATABASE_URL

if (!connectionString) {
  console.error('Error: NEON_DATABASE_URL is not set.')
  process.exit(1)
}

const sql = postgres(connectionString, { ssl: 'require' })

async function seedPolicies() {
  const inserted: string[] = []
  const skipped: string[] = []

  for (const p of DEFAULT_POLICIES) {
    const existing = await sql`
      SELECT 1 FROM wolfmed_mem_policies
      WHERE tenant_id = ${TENANT_ID} AND policy_key = ${p.policyKey} AND effective_until IS NULL
      LIMIT 1
    `
    if (existing.length > 0) {
      skipped.push(p.policyKey)
      continue
    }

    await sql`
      INSERT INTO wolfmed_mem_policies (tenant_id, policy_type, policy_key, policy_value, version)
      VALUES (${TENANT_ID}, ${p.policyType}, ${p.policyKey}, ${sql.json(p.policyValue as Parameters<typeof sql.json>[0])}, 1)
    `
    inserted.push(p.policyKey)
  }

  if (inserted.length > 0) {
    console.log('Seeded policies:')
    inserted.forEach((k) => console.log(`  ✓ ${k}`))
  }
  if (skipped.length > 0) {
    console.log('Already present (skipped):')
    skipped.forEach((k) => console.log(`  - ${k}`))
  }

  await sql.end()
}

seedPolicies().catch((err) => {
  console.error('Policy seed failed:', err)
  process.exit(1)
})
