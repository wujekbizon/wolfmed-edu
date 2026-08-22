import 'server-only'
import { and, desc, eq } from 'drizzle-orm'
import { db } from '@/server/db/index'
import { memEpisodes, type MemEpisode } from '@/server/db/memory-schema'

export interface NewEpisode {
  userId: string
  taskType: string // tutor_session | quiz | mindmap_review
  title: string
  summary: string
  outcome: string
  sourceRunId: string
  keySteps?: unknown
  artifacts?: unknown // quiz ids, mind map ids
  embedding?: number[] | null
}

export async function insertEpisode(episode: NewEpisode): Promise<MemEpisode> {
  const [row] = await db
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
