import postgres from 'postgres'

if (process.argv.slice(2).join(' ') !== '--apply') throw new Error('Use --apply. No changes made.')
const connectionString = process.env.NEON_DATABASE_URL
if (!connectionString) throw new Error('NEON_DATABASE_URL is not set')
const sql = postgres(connectionString, { ssl: 'require', max: 1 })
try {
  await sql.begin(async (tx) => {
    await tx`ALTER TABLE wolfmed_jev_audit_logs ADD COLUMN IF NOT EXISTS usage_aggregated boolean NOT NULL DEFAULT false`
    await tx`
      CREATE TABLE IF NOT EXISTS wolfmed_wolfek_interactions (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id varchar(256) REFERENCES wolfmed_users("userId") ON DELETE CASCADE,
        source varchar(32) NOT NULL,
        route varchar(64) NOT NULL,
        kind varchar(32) NOT NULL,
        question text,
        topic varchar(128),
        confidence real,
        outcome varchar(32) NOT NULL,
        needs_review boolean NOT NULL,
        created_at timestamptz NOT NULL DEFAULT now(),
        expires_at timestamptz NOT NULL
      )
    `
    await tx`
      CREATE TABLE IF NOT EXISTS wolfmed_wolfek_daily_metrics (
        day date NOT NULL,
        source varchar(32) NOT NULL,
        route varchar(64) NOT NULL,
        model varchar(64) NOT NULL,
        kind varchar(32) NOT NULL,
        outcome varchar(32) NOT NULL,
        topic varchar(128) NOT NULL,
        calls bigint NOT NULL DEFAULT 0,
        input_tokens bigint NOT NULL DEFAULT 0,
        output_tokens bigint NOT NULL DEFAULT 0,
        missing_usage bigint NOT NULL DEFAULT 0,
        latency_ms bigint NOT NULL DEFAULT 0,
        review_count bigint NOT NULL DEFAULT 0,
        PRIMARY KEY (day, source, route, model, kind, outcome, topic)
      )
    `
    await tx`CREATE INDEX IF NOT EXISTS wolfek_daily_source_day_idx ON wolfmed_wolfek_daily_metrics(source, day)`
    await tx`CREATE INDEX IF NOT EXISTS wolfek_interactions_source_created_idx ON wolfmed_wolfek_interactions(source, created_at)`
    await tx`CREATE INDEX IF NOT EXISTS wolfek_interactions_expires_idx ON wolfmed_wolfek_interactions(expires_at)`
    await tx`
      WITH pending AS (
        UPDATE wolfmed_jev_audit_logs SET usage_aggregated = true
        WHERE usage_aggregated = false
        RETURNING source, route, model, status, started_at, response_payload, latency_ms
      )
      INSERT INTO wolfmed_wolfek_daily_metrics
        (day, source, route, model, kind, outcome, topic, calls, input_tokens, output_tokens, missing_usage, latency_ms)
      SELECT (started_at AT TIME ZONE 'Europe/Warsaw')::date, source, route, model, 'provider', status, '', count(*),
        sum(CASE WHEN jsonb_typeof(response_payload #> '{usage,input_tokens}') = 'number' AND
          response_payload #>> '{usage,input_tokens}' ~ '^[0-9]{1,15}$'
          THEN (response_payload #>> '{usage,input_tokens}')::bigint ELSE 0 END),
        sum(CASE WHEN jsonb_typeof(response_payload #> '{usage,output_tokens}') = 'number' AND
          response_payload #>> '{usage,output_tokens}' ~ '^[0-9]{1,15}$'
          THEN (response_payload #>> '{usage,output_tokens}')::bigint ELSE 0 END),
        count(*) FILTER (WHERE NOT COALESCE(
          jsonb_typeof(response_payload #> '{usage,input_tokens}') = 'number' AND
          jsonb_typeof(response_payload #> '{usage,output_tokens}') = 'number' AND
          response_payload #>> '{usage,input_tokens}' ~ '^[0-9]{1,15}$' AND
          response_payload #>> '{usage,output_tokens}' ~ '^[0-9]{1,15}$', false)), sum(latency_ms)
      FROM pending GROUP BY 1, 2, 3, 4, 6
      ON CONFLICT (day, source, route, model, kind, outcome, topic) DO UPDATE SET
        calls = wolfmed_wolfek_daily_metrics.calls + EXCLUDED.calls,
        input_tokens = wolfmed_wolfek_daily_metrics.input_tokens + EXCLUDED.input_tokens,
        output_tokens = wolfmed_wolfek_daily_metrics.output_tokens + EXCLUDED.output_tokens,
        missing_usage = wolfmed_wolfek_daily_metrics.missing_usage + EXCLUDED.missing_usage,
        latency_ms = wolfmed_wolfek_daily_metrics.latency_ms + EXCLUDED.latency_ms
    `
  })
  console.log('Wolfek metrics ready; existing usage backfilled once.')
} finally {
  await sql.end()
}
