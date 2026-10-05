import postgres from 'postgres'

if (process.argv.slice(2).join(' ') !== '--apply') throw new Error('Use --apply. No changes made.')
const connectionString = process.env.NEON_DATABASE_URL
if (!connectionString) throw new Error('NEON_DATABASE_URL is not set')
const sql = postgres(connectionString, { ssl: 'require', max: 1 })
try {
  const result = await sql`DELETE FROM wolfmed_jev_audit_logs WHERE expires_at <= now()`
  const interactions = await sql`DELETE FROM wolfmed_wolfek_interactions WHERE expires_at <= now()`
  console.log(`Deleted ${result.count} expired Jev audit logs.`)
  console.log(`Deleted ${interactions.count} expired Wolfek interactions.`)
} finally {
  await sql.end()
}
