import postgres from 'postgres'

if (process.argv.slice(2).join(' ') !== '--apply') throw new Error('Use --apply. No changes made.')
const connectionString = process.env.NEON_DATABASE_URL
if (!connectionString) throw new Error('NEON_DATABASE_URL is not set')
const sql = postgres(connectionString, { ssl: 'require', max: 1 })
try {
  const result = await sql`
    DELETE FROM wolfmed_learning_practice_events
    WHERE type = 'support_decided' AND "createdAt" < now() - interval '30 days'
  `
  console.log(`Deleted ${result.count} expired support decisions.`)
} finally {
  await sql.end()
}
