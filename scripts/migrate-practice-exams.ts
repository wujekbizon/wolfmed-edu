import postgres from 'postgres'

if (process.argv.slice(2).join(' ') !== '--apply') {
  throw new Error('Use --apply to add practice exam columns. No changes made.')
}
const connectionString = process.env.NEON_DATABASE_URL
if (!connectionString) throw new Error('NEON_DATABASE_URL is not set')
const target = new URL(connectionString)
const sql = postgres(connectionString, { ssl: 'require', max: 1, connect_timeout: 10 })

try {
  console.log(`Migrating ${target.hostname}${target.pathname}`)
  await sql.begin(async (tx) => {
    await tx`SET LOCAL lock_timeout = '3s'`
    await tx`SET LOCAL statement_timeout = '15s'`
    await tx`
      ALTER TABLE public.wolfmed_test_sessions
        ADD COLUMN IF NOT EXISTS mode varchar(16) NOT NULL DEFAULT 'EXAM',
        ADD COLUMN IF NOT EXISTS progress jsonb NOT NULL DEFAULT '{}'::jsonb,
        ADD COLUMN IF NOT EXISTS "questionIds" jsonb NOT NULL DEFAULT '[]'::jsonb
    `
    const columns = await tx`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'wolfmed_test_sessions'
        AND column_name IN ('mode', 'progress', 'questionIds')
      ORDER BY column_name
    `
    console.table(columns)
  })
  console.log('Practice exam columns ready.')
} finally {
  await sql.end()
}
