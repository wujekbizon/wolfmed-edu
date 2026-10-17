import postgres from 'postgres'

if (process.argv.slice(2).join(' ') !== '--apply') throw new Error('Use --apply. No changes made.')
const connectionString = process.env.NEON_DATABASE_URL
if (!connectionString) throw new Error('NEON_DATABASE_URL is not set')
const sql = postgres(connectionString, { ssl: 'require', max: 1 })
try {
  await sql.begin(async (tx) => {
    await tx`
      CREATE TABLE IF NOT EXISTS wolfmed_jev_audit_logs (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id varchar(256) REFERENCES wolfmed_users("userId") ON DELETE CASCADE,
        session_id uuid REFERENCES wolfmed_learning_practice_sessions(id) ON DELETE CASCADE,
        source varchar(32) NOT NULL,
        route varchar(64) NOT NULL,
        policy_version varchar(128) NOT NULL,
        model varchar(64) NOT NULL,
        request_payload jsonb NOT NULL,
        response_payload jsonb,
        response_text text,
        status varchar(32) NOT NULL,
        http_status integer,
        error_name varchar(128),
        error_message text,
        latency_ms integer NOT NULL,
        started_at timestamptz NOT NULL,
        created_at timestamptz NOT NULL DEFAULT now(),
        expires_at timestamptz NOT NULL
      )
    `
    await tx`CREATE INDEX IF NOT EXISTS jev_audit_user_created_idx ON wolfmed_jev_audit_logs(user_id, created_at)`
    await tx`CREATE INDEX IF NOT EXISTS jev_audit_source_created_idx ON wolfmed_jev_audit_logs(source, created_at)`
    await tx`CREATE INDEX IF NOT EXISTS jev_audit_status_created_idx ON wolfmed_jev_audit_logs(status, created_at)`
    await tx`CREATE INDEX IF NOT EXISTS jev_audit_expires_idx ON wolfmed_jev_audit_logs(expires_at)`
  })
  console.log('Jev audit log table created.')
} finally {
  await sql.end()
}
