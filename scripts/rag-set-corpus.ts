/**
 * Point the app at an existing RAG corpus (e.g. one created in the Cloud Console).
 * Run with:
 *   pnpm run rag:set-corpus "projects/.../locations/us-central1/ragCorpora/123" [displayName]
 *
 * Overwrites the single ragConfig row so the tutor queries this corpus. Standalone
 * raw SQL (matches seed-courses.ts) — no @/ alias / server-only issues. Requires
 * NEON_DATABASE_URL.
 */

import 'dotenv/config'
import postgres from 'postgres'

const corpusName = process.argv[2]
const displayName = process.argv[3] ?? 'wolfmed-kb'

if (!corpusName || !/\/ragCorpora\/\d+$/.test(corpusName)) {
  console.error('Usage: pnpm run rag:set-corpus "projects/.../locations/<region>/ragCorpora/<id>" [displayName]')
  console.error('Got:', corpusName ?? '(nothing)')
  process.exit(1)
}

const connectionString = process.env.NEON_DATABASE_URL
if (!connectionString) {
  console.error('Error: NEON_DATABASE_URL is not set.')
  process.exit(1)
}

const corpusId = corpusName.split('/ragCorpora/')[1]!
const sql = postgres(connectionString, { ssl: 'require' })

async function setCorpus() {
  await sql.begin(async (tx) => {
    await tx`DELETE FROM wolfmed_rag_config`
    await tx`
      INSERT INTO wolfmed_rag_config
        (store_name, store_display_name, deployment_mode, embedding_model, corpus_id, updated_at)
      VALUES
        (${corpusName}, ${displayName}, 'SERVERLESS', 'gemini-embedding-001', ${corpusId}, now())
    `
  })

  const [row] = await sql`SELECT store_name, deployment_mode, embedding_model FROM wolfmed_rag_config`
  console.log('ragConfig now points at:')
  console.log(`  store_name:      ${row?.store_name}`)
  console.log(`  deployment_mode: ${row?.deployment_mode}`)
  console.log(`  embedding_model: ${row?.embedding_model}`)
  console.log('\nThe tutor will use this corpus. Upload docs + test in /admin/rag.')

  await sql.end()
}

setCorpus().catch((err) => {
  console.error('rag:set-corpus failed:', err)
  process.exit(1)
})
