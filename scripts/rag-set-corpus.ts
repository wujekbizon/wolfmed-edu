/**
 * Point the app at an existing RAG corpus (e.g. one created in the Cloud Console).
 * Run with:
 *   pnpm run rag:set-corpus "projects/.../locations/us-central1/ragCorpora/123" [embeddingModel]
 *
 * Overwrites the single ragConfig row so the tutor queries this corpus. Standalone
 * raw SQL (matches seed-courses.ts) — no @/ alias / server-only issues. Requires
 * NEON_DATABASE_URL.
 */

import 'dotenv/config'
import postgres from 'postgres'

const corpusName = process.argv[2]
const embeddingModel = process.argv[3] ?? 'text-multilingual-embedding-002'
const DISPLAY_NAME = 'wolfmed-kb'

if (!corpusName || !/\/ragCorpora\/\d+$/.test(corpusName)) {
  console.error('Usage: pnpm run rag:set-corpus "projects/.../locations/<region>/ragCorpora/<id>" [embeddingModel]')
  console.error('Got:', corpusName ?? '(nothing)')
  process.exit(1)
}

const connectionString = process.env.NEON_DATABASE_URL
if (!connectionString) {
  console.error('Error: NEON_DATABASE_URL is not set.')
  process.exit(1)
}

const sql = postgres(connectionString, { ssl: 'require' })

async function setCorpus(corpus: string, model: string) {
  const corpusId = corpus.split('/ragCorpora/')[1]!

  await sql`DELETE FROM wolfmed_rag_config`
  await sql`
    INSERT INTO wolfmed_rag_config
      (store_name, store_display_name, deployment_mode, embedding_model, corpus_id, updated_at)
    VALUES
      (${corpus}, ${DISPLAY_NAME}, 'SERVERLESS', ${model}, ${corpusId}, now())
  `

  const [row] = await sql`SELECT store_name, deployment_mode, embedding_model FROM wolfmed_rag_config`
  console.log('ragConfig now points at:')
  console.log(`  store_name:      ${row?.store_name}`)
  console.log(`  deployment_mode: ${row?.deployment_mode}`)
  console.log(`  embedding_model: ${row?.embedding_model}`)
  console.log('\nThe tutor will use this corpus. Upload docs + test in /admin/rag.')

  await sql.end()
}

setCorpus(corpusName, embeddingModel).catch((err) => {
  console.error('rag:set-corpus failed:', err)
  process.exit(1)
})
