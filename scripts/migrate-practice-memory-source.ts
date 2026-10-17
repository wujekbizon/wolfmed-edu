import postgres from 'postgres'

if (process.argv.slice(2).join(' ') !== '--apply') {
  throw new Error('Use --apply to enable the practice memory source. No changes made.')
}
const connectionString = process.env.NEON_DATABASE_URL
if (!connectionString) throw new Error('NEON_DATABASE_URL is not set')
const sql = postgres(connectionString, { ssl: 'require', max: 1 })
try {
  await sql.begin(async (tx) => {
    await tx`
      ALTER TABLE wolfmed_mem_facts
      DROP CONSTRAINT IF EXISTS mem_fact_source_chk
    `
    await tx`
      ALTER TABLE wolfmed_mem_facts
      ADD CONSTRAINT mem_fact_source_chk
      CHECK (source IN ('user_stated','quiz_derived','practice_derived','mindmap_derived','llm_inferred','admin_set'))
    `
  })
  console.log('Practice memory source enabled.')
} finally {
  await sql.end()
}

