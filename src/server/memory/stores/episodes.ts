import 'server-only'
import { and, desc, eq, sql } from 'drizzle-orm'
import { db } from '@/server/db/index'
import { memEpisodes, type MemEpisode } from '@/server/db/memory-schema'
import type { NewMemoryEpisode } from '@/types/memoryTypes'

export async function insertEpisode(episode: NewMemoryEpisode): Promise<MemEpisode> {
  return db.transaction(async (tx) => {
    const lockKey = `${episode.userId}:${episode.sourceRunId}`
    await tx.execute(sql`select pg_advisory_xact_lock(hashtext(${lockKey}))`)

    const [existing] = await tx
      .select()
      .from(memEpisodes)
      .where(
        and(
          eq(memEpisodes.userId, episode.userId),
          eq(memEpisodes.sourceRunId, episode.sourceRunId)
        )
      )
      .limit(1)
    if (existing) {
      const [updated] = await tx
        .update(memEpisodes)
        .set({
          taskType: episode.taskType,
          title: episode.title,
          summary: episode.summary,
          outcome: episode.outcome,
          keySteps: episode.keySteps ?? null,
          artifacts: episode.artifacts ?? null,
          embedding: episode.embedding ?? existing.embedding,
        })
        .where(eq(memEpisodes.episodeId, existing.episodeId))
        .returning()
      return updated!
    }

    const [row] = await tx
      .insert(memEpisodes)
      .values({
        userId: episode.userId,
        taskType: episode.taskType,
        title: episode.title,
        summary: episode.summary,
        outcome: episode.outcome,
        sourceRunId: episode.sourceRunId,
        keySteps: episode.keySteps ?? null,
        artifacts: episode.artifacts ?? null,
        embedding: episode.embedding ?? null,
      })
      .returning()
    return row!
  })
}

// Most recent episodes for a user (optionally by task type) — powers the tutor's
// "ostatnio przerabialiśmy…" opener.
export async function getRecentEpisodes(
  userId: string,
  opts: { taskType?: string; limit?: number } = {}
): Promise<MemEpisode[]> {
  const scope = opts.taskType
    ? and(eq(memEpisodes.userId, userId), eq(memEpisodes.taskType, opts.taskType), eq(memEpisodes.status, 'active'))
    : and(eq(memEpisodes.userId, userId), eq(memEpisodes.status, 'active'))

  return db
    .select()
    .from(memEpisodes)
    .where(scope)
    .orderBy(desc(memEpisodes.completedAt))
    .limit(opts.limit ?? 5)
}
