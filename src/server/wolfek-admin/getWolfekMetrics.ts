import 'server-only'
import { sql } from 'drizzle-orm'
import { requireAdmin } from '@/helpers/requireAdmin'
import { db } from '@/server/db/index'
import type { WolfekAdminDaily, WolfekAdminFilters, WolfekAdminLifetime, WolfekAdminModel, WolfekAdminSummary, WolfekAdminTopic, WolfekAdminRoute } from '@/types/wolfekAdminTypes'

export async function getWolfekMetrics(filters: WolfekAdminFilters) {
  await requireAdmin()
  const source = filters.source === 'all' ? sql`true` : sql`source = ${filters.source}`
  const where = sql`${source} AND day BETWEEN ${filters.from}::date AND ${filters.to}::date`
  const [summary, daily, topics, models, lifetime, routes] = await Promise.all([
    db.execute(sql`SELECT
      COALESCE(sum(calls) FILTER (WHERE kind = 'prepared_batch' AND outcome = 'provider'), 0)::float8 AS "preparedBatches",
      COALESCE(sum(calls) FILTER (WHERE kind = 'question' AND outcome = 'batch_reuse'), 0)::float8 AS "reusedButtons",
      COALESCE(sum(calls) FILTER (WHERE kind = 'question' AND outcome = 'typed_provider'), 0)::float8 AS "typedQuestions",
      COALESCE(sum(calls) FILTER (WHERE kind = 'question'), 0)::float8 AS questions,
      COALESCE(sum(calls) FILTER (WHERE kind = 'topic_click'), 0)::float8 AS clicks,
      COALESCE(sum(calls) FILTER (WHERE kind = 'question' AND outcome = 'cache_hit'), 0)::float8 AS "cacheHits",
      COALESCE(sum(review_count), 0)::float8 AS reviews,
      COALESCE(sum(calls) FILTER (WHERE kind = 'provider'), 0)::float8 AS "providerCalls",
      COALESCE(sum(calls) FILTER (WHERE kind = 'provider' AND outcome <> 'success'), 0)::float8 AS errors,
      COALESCE(sum(input_tokens), 0)::float8 AS "inputTokens", COALESCE(sum(output_tokens), 0)::float8 AS "outputTokens",
      COALESCE(sum(missing_usage), 0)::float8 AS "missingUsage",
      COALESCE(sum(latency_ms)::float8 / NULLIF(sum(calls) FILTER (WHERE kind = 'provider'), 0), 0) AS "avgLatency"
      FROM wolfmed_wolfek_daily_metrics WHERE ${where}`),
    db.execute(sql`SELECT day::text,
      COALESCE(sum(calls) FILTER (WHERE kind = 'question'), 0)::float8 AS questions,
      COALESCE(sum(calls) FILTER (WHERE kind = 'topic_click'), 0)::float8 AS clicks,
      COALESCE(sum(calls) FILTER (WHERE outcome = 'cache_hit'), 0)::float8 AS "cacheHits",
      COALESCE(sum(calls) FILTER (WHERE kind = 'provider'), 0)::float8 AS "providerCalls",
      COALESCE(sum(calls) FILTER (WHERE kind = 'provider' AND outcome <> 'success'), 0)::float8 AS errors,
      sum(input_tokens)::float8 AS "inputTokens", sum(output_tokens)::float8 AS "outputTokens"
      FROM wolfmed_wolfek_daily_metrics WHERE ${where} GROUP BY day ORDER BY day`),
    db.execute(sql`SELECT source, topic,
      COALESCE(sum(calls) FILTER (WHERE kind = 'question'), 0)::float8 AS questions,
      COALESCE(sum(calls) FILTER (WHERE kind = 'topic_click'), 0)::float8 AS clicks
      FROM wolfmed_wolfek_daily_metrics WHERE ${where} AND kind <> 'provider'
      GROUP BY source, topic ORDER BY sum(calls) DESC LIMIT 12`),
    db.execute(sql`SELECT model, sum(calls)::float8 AS calls, sum(input_tokens)::float8 AS "inputTokens",
      sum(output_tokens)::float8 AS "outputTokens", sum(missing_usage)::float8 AS "missingUsage"
      FROM wolfmed_wolfek_daily_metrics WHERE ${where} AND kind = 'provider' GROUP BY model ORDER BY sum(calls) DESC`),
    db.execute(sql`SELECT COALESCE(sum(calls) FILTER (WHERE kind = 'provider'), 0)::float8 AS calls,
      COALESCE(sum(input_tokens), 0)::float8 AS "inputTokens", COALESCE(sum(output_tokens), 0)::float8 AS "outputTokens",
      COALESCE(sum(missing_usage), 0)::float8 AS "missingUsage",
      min(day) FILTER (WHERE kind = 'provider')::text AS "providerSince",
      min(day) FILTER (WHERE kind <> 'provider')::text AS "activitySince"
      FROM wolfmed_wolfek_daily_metrics WHERE ${source}`),
    db.execute(sql`SELECT route,
      COALESCE(sum(calls) FILTER (WHERE kind = 'question'), 0)::float8 AS questions,
      COALESCE(sum(calls) FILTER (WHERE kind = 'topic_click'), 0)::float8 AS clicks,
      COALESCE(sum(calls) FILTER (WHERE kind = 'provider'), 0)::float8 AS "providerCalls"
      FROM wolfmed_wolfek_daily_metrics WHERE ${where} GROUP BY route ORDER BY sum(calls) DESC`),
  ])
  return { summary: summary.rows[0] as unknown as WolfekAdminSummary,
    daily: daily.rows as unknown as WolfekAdminDaily[], topics: topics.rows as unknown as WolfekAdminTopic[],
    models: models.rows as unknown as WolfekAdminModel[], lifetime: lifetime.rows[0] as unknown as WolfekAdminLifetime,
    routes: routes.rows as unknown as WolfekAdminRoute[] }
}
