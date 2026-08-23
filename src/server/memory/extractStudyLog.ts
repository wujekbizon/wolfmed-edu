import 'server-only'
import { and, eq } from 'drizzle-orm'
import { db } from '@/server/db/index'
import { studyLogs } from '@/server/db/schema'
import { safeEmbedMemory } from './safeEmbedMemory'
import { insertEpisode } from './stores/episodes'
import type { StudyLogMemoryEventInput } from '@/types/memoryTypes'

export async function onStudyLogRecorded(
  params: StudyLogMemoryEventInput
): Promise<void> {
  const { userId, studyLogId, embed = true } = params
  try {
    const [log] = await db
      .select()
      .from(studyLogs)
      .where(and(eq(studyLogs.id, studyLogId), eq(studyLogs.userId, userId)))
      .limit(1)
    if (!log) return

    const detail = log.note?.trim() || log.categoryKey || log.procedureId
    const summary = detail
      ? `Nauka: ${log.minutes} min — ${detail}.`
      : `Zarejestrowano ${log.minutes} min nauki.`
    await insertEpisode({
      userId,
      taskType: log.source === 'practical-exam' ? 'practical_exam' : 'study_session',
      title: log.source === 'practical-exam' ? 'Egzamin praktyczny' : 'Sesja nauki',
      summary,
      outcome: 'completed',
      sourceRunId: `study:${log.id}`,
      artifacts: {
        studyLogId: log.id,
        source: log.source,
        minutes: log.minutes,
        categoryKey: log.categoryKey,
        procedureId: log.procedureId,
        conceptId: log.conceptId,
      },
      embedding: embed ? await safeEmbedMemory(summary) : null,
    })
  } catch (error) {
    console.error('[memory] onStudyLogRecorded failed:', error)
  }
}
