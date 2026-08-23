import { db } from '@/server/db/index'
import { memTraces, memEpisodes } from '@/server/db/memory-schema'
import { and, eq, lt, or, sql } from 'drizzle-orm'
import { NextResponse } from 'next/server'
import { RETENTION } from '@/server/memory/config'
import { cleanupDeletedAccountOperations } from '@/server/account-deletion/cleanupDeletedAccountOperations'

const DAY_MS = 24 * 60 * 60 * 1000

// Nightly memory retention: traces, active/revoked episodes, and expired/revoked
// facts use their configured windows. Facts are deleted FK-safely — the
// self-referential superseded_by means a revoked fact still pointed at by another
// row is kept until that pointer is gone (chains clear from the tail over runs).
export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const now = new Date()
    const traceCutoff = new Date(now.getTime() - RETENTION.traceDays * DAY_MS)
    const revokedCutoff = new Date(now.getTime() - RETENTION.revokedFactDays * DAY_MS)
    const activeEpisodeCutoff = new Date(
      now.getTime() - RETENTION.activeEpisodeDays * DAY_MS
    )

    const tracesDeleted = await db
      .delete(memTraces)
      .where(lt(memTraces.createdAt, traceCutoff))
      .returning({ id: memTraces.traceId })

    const episodesDeleted = await db
      .delete(memEpisodes)
      .where(
        or(
          and(eq(memEpisodes.status, 'revoked'), lt(memEpisodes.completedAt, revokedCutoff)),
          and(
            eq(memEpisodes.status, 'active'),
            lt(memEpisodes.completedAt, activeEpisodeCutoff)
          )
        )
      )
      .returning({ id: memEpisodes.episodeId })

    const factResult = await db.execute(sql`
      DELETE FROM wolfmed_mem_facts f
      WHERE (
        (f.expires_at IS NOT NULL AND f.expires_at < now())
        OR (f.status = 'revoked' AND f.created_at < ${revokedCutoff})
      )
      AND NOT EXISTS (SELECT 1 FROM wolfmed_mem_facts g WHERE g.superseded_by = f.fact_id)
      RETURNING f.fact_id
    `)
    const factsDeleted = Array.isArray((factResult as { rows?: unknown[] }).rows)
      ? (factResult as { rows: unknown[] }).rows.length
      : ((factResult as { rowCount?: number }).rowCount ?? 0)
    const deletedAccounts = await cleanupDeletedAccountOperations(now)

    return NextResponse.json({
      success: true,
      traces: tracesDeleted.length,
      episodes: episodesDeleted.length,
      facts: factsDeleted,
      deletedAccounts,
      timestamp: now.toISOString(),
    })
  } catch (error) {
    console.error('[Cron] Memory retention failed:', error)
    return NextResponse.json({ error: 'Retention failed' }, { status: 500 })
  }
}
