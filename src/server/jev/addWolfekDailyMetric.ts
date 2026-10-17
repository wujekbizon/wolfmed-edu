import 'server-only'
import { sql } from 'drizzle-orm'
import { wolfekDailyMetrics as metrics } from '@/server/db/schema'
import { getWolfekMetricDay } from '@/helpers/getWolfekMetricDay'
import type { WolfekMetricIncrement, WolfekMetricsTx } from '@/types/wolfekMetricTypes'

export async function addWolfekDailyMetric(tx: WolfekMetricsTx, increment: WolfekMetricIncrement) {
  const { happenedAt, ...values } = increment
  await tx.insert(metrics).values({ ...values, day: getWolfekMetricDay(happenedAt), calls: 1 })
    .onConflictDoUpdate({
      target: [metrics.day, metrics.source, metrics.route, metrics.model, metrics.kind, metrics.outcome, metrics.topic],
      set: {
        calls: sql`${metrics.calls} + 1`,
        inputTokens: sql`${metrics.inputTokens} + ${values.inputTokens}`,
        outputTokens: sql`${metrics.outputTokens} + ${values.outputTokens}`,
        missingUsage: sql`${metrics.missingUsage} + ${values.missingUsage}`,
        latencyMs: sql`${metrics.latencyMs} + ${values.latencyMs}`,
        reviewCount: sql`${metrics.reviewCount} + ${values.reviewCount}`,
      },
    })
}
