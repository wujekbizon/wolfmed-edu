import 'server-only'
import { and, desc, eq, gte } from 'drizzle-orm'
import { db } from '@/server/db/index'
import { studyLogs } from '@/server/db/schema'

export async function getRelevantStudyActivity(userId: string, category: string) {
  const since = new Date(Date.now() - 30 * 86400000)
  const rows = await db.select({ minutes: studyLogs.minutes, source: studyLogs.source,
    recordedAt: studyLogs.studyDate }).from(studyLogs).where(and(
    eq(studyLogs.userId, userId), eq(studyLogs.categoryKey, category), gte(studyLogs.studyDate, since),
  )).orderBy(desc(studyLogs.studyDate)).limit(12)
  return { sampledEntries: rows.length, sampleMinutes: rows.reduce((total, row) => total + row.minutes, 0),
    latestAt: rows[0]?.recordedAt.toISOString() ?? null,
    sources: [...new Set(rows.map((row) => row.source))] }
}
