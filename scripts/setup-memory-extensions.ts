/**
 * Enable the Postgres extensions the memory layer needs.
 * Run with: pnpm run db:memory:extensions
 *
 * Must run BEFORE the first `pnpm run db:push` that creates the wolfmed_mem_*
 * tables — the HNSW (vector) and gin_trgm indexes require these extensions to
 * exist first. Both are supported on Neon. Idempotent.
 *
 * Requires NEON_DATABASE_URL to be set in .env / .env.local
 */

import 'dotenv/config'
import postgres from 'postgres'

const connectionString = process.env.NEON_DATABASE_URL

if (!connectionString) {
  console.error('Error: NEON_DATABASE_URL is not set.')
  process.exit(1)
}

const sql = postgres(connectionString, { ssl: 'require' })

async function setupExtensions() {
  await sql`CREATE EXTENSION IF NOT EXISTS vector`
  await sql`CREATE EXTENSION IF NOT EXISTS pg_trgm`

  const rows = await sql<{ extname: string }[]>`
    SELECT extname FROM pg_extension WHERE extname IN ('vector', 'pg_trgm') ORDER BY extname
  `

  console.log('Enabled extensions:')
  rows.forEach((r) => console.log(`  ✓ ${r.extname}`))

  if (rows.length < 2) {
    console.error('Expected both "vector" and "pg_trgm" to be present.')
    await sql.end()
    process.exit(1)
  }

  await sql.end()
}

setupExtensions().catch((err) => {
  console.error('Extension setup failed:', err)
  process.exit(1)
})
