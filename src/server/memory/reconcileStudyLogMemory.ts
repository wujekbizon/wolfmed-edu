import 'server-only'
import { desc, eq } from 'drizzle-orm'
import { db } from '@/server/db/index'
import { studyLogs } from '@/server/db/schema'
import { onStudyLogRecorded } from './extractStudyLog'

export async function reconcileStudyLogMemory(userId: string): Promise<boolean> {
  try {
    const logs = await db
      .select({ id: studyLogs.id })
      .from(studyLogs)
      .where(eq(studyLogs.userId, userId))
      .orderBy(desc(studyLogs.studyDate))
      .limit(30)

    await Promise.all(
      logs.map(({ id }) => onStudyLogRecorded({ userId, studyLogId: id, embed: false }))
    )
    return true
  } catch (error) {
    console.error('[memory] reconcileStudyLogMemory failed:', error)
    return false
  }
}
