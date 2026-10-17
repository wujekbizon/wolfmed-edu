import 'server-only'

import { and, desc, eq, inArray, max, sql } from 'drizzle-orm'
import { PRACTICE_POLICY_VERSION } from '@/constants/learningPractice'
import { db } from '@/server/db/index'
import { learningPracticeItems, learningPracticeSessions, testSessions } from '@/server/db/schema'
import type { LearningSessionResume, PracticeExamResume } from '@/types/practiceResumeTypes'

export async function getActivePracticeExamResumes(userId: string, categories: string[]) {
  if (!categories.length) return [] satisfies PracticeExamResume[]
  const rows = await db.select({
    sessionId: testSessions.id,
    category: testSessions.category,
    numberOfQuestions: testSessions.numberOfQuestions,
    progress: testSessions.progress,
    lastActivityAt: testSessions.lastActivityAt,
  }).from(testSessions).where(and(
    eq(testSessions.userId, userId),
    eq(testSessions.mode, 'PRACTICE'),
    eq(testSessions.status, 'ACTIVE'),
    inArray(testSessions.category, categories)
  )).orderBy(desc(testSessions.lastActivityAt))

  return rows.map((row) => ({
    sessionId: row.sessionId,
    category: row.category,
    numberOfQuestions: row.numberOfQuestions,
    answeredQuestions: Object.keys(row.progress).length,
    lastActivityAt: row.lastActivityAt,
  })) satisfies PracticeExamResume[]
}

export async function getActiveLearningResumes(userId: string, categories: string[]) {
  if (!categories.length) return [] satisfies LearningSessionResume[]
  const rows = await db.select({
    sessionId: learningPracticeSessions.id,
    category: learningPracticeSessions.category,
    totalQuestions: sql<number>`jsonb_array_length(${learningPracticeSessions.items})`.mapWith(Number),
    summary: learningPracticeSessions.summary,
    startedAt: learningPracticeSessions.startedAt,
  }).from(learningPracticeSessions).where(and(
    eq(learningPracticeSessions.userId, userId),
    eq(learningPracticeSessions.status, 'active'),
    eq(learningPracticeSessions.policyVersion, PRACTICE_POLICY_VERSION),
    inArray(learningPracticeSessions.category, categories)
  ))
  if (!rows.length) return []

  const activity = await db.select({
    sessionId: learningPracticeItems.sessionId,
    lastActivityAt: max(learningPracticeItems.updatedAt),
  }).from(learningPracticeItems).where(inArray(
    learningPracticeItems.sessionId,
    rows.map((row) => row.sessionId)
  )).groupBy(learningPracticeItems.sessionId)
  const activityBySession = new Map(activity.map((row) => [row.sessionId, row.lastActivityAt]))

  return rows.map((row) => ({
    sessionId: row.sessionId,
    category: row.category,
    totalQuestions: row.totalQuestions,
    completedQuestions: Object.values(row.summary).reduce((sum, value) => sum + value, 0),
    lastActivityAt: activityBySession.get(row.sessionId) ?? row.startedAt,
  })).sort((left, right) => right.lastActivityAt.getTime() - left.lastActivityAt.getTime()) satisfies LearningSessionResume[]
}
