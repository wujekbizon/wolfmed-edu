import postgres from 'postgres'

if (process.argv.slice(2).join(' ') !== '--apply') {
  throw new Error('Use --apply to create the practice tables. No changes made.')
}
const connectionString = process.env.NEON_DATABASE_URL
if (!connectionString) throw new Error('NEON_DATABASE_URL is not set')
const sql = postgres(connectionString, { ssl: 'require', max: 1 })

try {
  await sql.begin(async (tx) => {
    await tx`
      CREATE TABLE IF NOT EXISTS wolfmed_learning_practice_sessions (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "userId" varchar(256) NOT NULL REFERENCES wolfmed_users("userId") ON DELETE CASCADE,
        category varchar(256) NOT NULL,
        items jsonb NOT NULL,
        "activeIndex" integer NOT NULL DEFAULT 0,
        version integer NOT NULL DEFAULT 0,
        status varchar(32) NOT NULL DEFAULT 'active',
        "policyVersion" varchar(64) NOT NULL,
        "catalogVersion" varchar(64) NOT NULL,
        "experimentArm" varchar(32) NOT NULL DEFAULT 'rules',
        "startedAt" timestamp NOT NULL DEFAULT now(),
        "finishedAt" timestamp
      )
    `
    await tx`CREATE INDEX IF NOT EXISTS practice_user_category_idx
      ON wolfmed_learning_practice_sessions ("userId", category)`
    await tx`CREATE UNIQUE INDEX IF NOT EXISTS practice_active_idx
      ON wolfmed_learning_practice_sessions ("userId", category) WHERE status = 'active'`
    await tx`
      CREATE TABLE IF NOT EXISTS wolfmed_learning_practice_events (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "sessionId" uuid NOT NULL REFERENCES wolfmed_learning_practice_sessions(id) ON DELETE CASCADE,
        "eventId" uuid NOT NULL,
        ordinal integer NOT NULL,
        type varchar(64) NOT NULL,
        "questionId" uuid,
        "questionRevision" varchar(64),
        payload jsonb NOT NULL,
        response jsonb NOT NULL,
        "createdAt" timestamp NOT NULL DEFAULT now()
      )
    `
    await tx`CREATE UNIQUE INDEX IF NOT EXISTS practice_event_id_idx
      ON wolfmed_learning_practice_events ("sessionId", "eventId")`
    await tx`CREATE UNIQUE INDEX IF NOT EXISTS practice_event_ordinal_idx
      ON wolfmed_learning_practice_events ("sessionId", ordinal)`
  })
  console.log('Practice tables created.')
} finally {
  await sql.end()
}
