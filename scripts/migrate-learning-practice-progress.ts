import postgres from 'postgres'

if (process.argv.slice(2).join(' ') !== '--apply') {
  throw new Error('Use --apply to migrate practice progress. No changes made.')
}
const connectionString = process.env.NEON_DATABASE_URL
if (!connectionString) throw new Error('NEON_DATABASE_URL is not set')
const sql = postgres(connectionString, { ssl: 'require', max: 1 })

try {
  await sql.begin(async (tx) => {
    await tx`
      ALTER TABLE wolfmed_learning_practice_sessions
      ADD COLUMN IF NOT EXISTS summary jsonb
    `
    await tx`
      CREATE TABLE IF NOT EXISTS wolfmed_learning_practice_items (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "sessionId" uuid NOT NULL REFERENCES wolfmed_learning_practice_sessions(id) ON DELETE CASCADE,
        "questionId" uuid NOT NULL,
        position integer NOT NULL,
        item jsonb NOT NULL,
        "updatedAt" timestamp NOT NULL DEFAULT now()
      )
    `
    await tx`CREATE UNIQUE INDEX IF NOT EXISTS practice_item_question_idx
      ON wolfmed_learning_practice_items ("sessionId", "questionId")`
    await tx`CREATE UNIQUE INDEX IF NOT EXISTS practice_item_position_idx
      ON wolfmed_learning_practice_items ("sessionId", position)`
    await tx`
      INSERT INTO wolfmed_learning_practice_items ("sessionId", "questionId", position, item)
      SELECT s.id, (entry.value->>'id')::uuid, (entry.ordinality - 1)::integer, entry.value
      FROM wolfmed_learning_practice_sessions AS s,
        LATERAL jsonb_array_elements(s.items) WITH ORDINALITY AS entry(value, ordinality)
      WHERE jsonb_array_length(coalesce(entry.value->'attempts', '[]'::jsonb)) > 0
        OR entry.value->>'outcome' IS NOT NULL
        OR entry.value->>'hintOpened' = 'true'
        OR entry.value->>'revealed' = 'true'
        OR entry.value->>'priorExposure' = 'true'
        OR entry.value->'support' IS NOT NULL
      ON CONFLICT ("sessionId", "questionId") DO NOTHING
    `
    await tx`
      UPDATE wolfmed_learning_practice_sessions AS s SET summary = (
        SELECT jsonb_build_object(
          'unassisted', count(*) FILTER (WHERE entry.value->>'outcome' = 'unassisted'),
          'assisted', count(*) FILTER (WHERE entry.value->>'outcome' = 'assisted'),
          'revealed', count(*) FILTER (WHERE entry.value->>'outcome' = 'revealed'),
          'skipped', count(*) FILTER (WHERE entry.value->>'outcome' = 'skipped'),
          'invalid', count(*) FILTER (WHERE entry.value->>'outcome' = 'invalid')
        )
        FROM jsonb_array_elements(s.items) AS entry(value)
      )
      WHERE s.summary IS NULL
    `
    await tx`
      ALTER TABLE wolfmed_learning_practice_sessions
      ALTER COLUMN summary SET DEFAULT '{"unassisted":0,"assisted":0,"revealed":0,"skipped":0,"invalid":0}'::jsonb,
      ALTER COLUMN summary SET NOT NULL
    `
    await tx`
      UPDATE wolfmed_learning_practice_sessions AS s SET items = (
        SELECT jsonb_agg(jsonb_build_object(
          'id', entry.value->>'id',
          'revision', entry.value->>'revision',
          'attempts', '[]'::jsonb,
          'hintOpened', false,
          'revealed', false,
          'priorExposure', coalesce((entry.value->>'priorExposure')::boolean, false),
          'version', 0,
          'outcome', NULL
        ) ORDER BY entry.ordinality)
        FROM jsonb_array_elements(s.items) WITH ORDINALITY AS entry(value, ordinality)
      )
      WHERE jsonb_array_length(s.items) > 0
    `
  })
  console.log('Practice progress migrated.')
} finally {
  await sql.end()
}

