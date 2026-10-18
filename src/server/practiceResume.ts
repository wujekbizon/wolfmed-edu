import 'server-only'

import { and, desc, eq, inArray, sql } from 'drizzle-orm'
import { PRACTICE_POLICY_VERSION } from '@/constants/learningPractice'
import { db } from '@/server/db/index'
import { learningPracticeItems, learningPracticeSessions, testSessions } from '@/server/db/schema'
import type { LearningSessionResume, PracticeExamResume } from '@/types/practiceResumeTypes'

export async function getActivePracticeExamResumes(userId: string, categories: string[], limit?: number) {
  if (!categories.length) return [] satisfies PracticeExamResume[]
  const query = db.select({
    sessionId: testSessions.id,
    category: testSessions.category,
    numberOfQuestions: testSessions.numberOfQuestions,
    answeredQuestions: sql<number>`(select count(*) from jsonb_object_keys(${testSessions.progress}))`.mapWith(Number),
    lastActivityAt: testSessions.lastActivityAt,
  }).from(testSessions).where(and(
    eq(testSessions.userId, userId),
    eq(testSessions.mode, 'PRACTICE'),
    eq(testSessions.status, 'ACTIVE'),
    inArray(testSessions.category, categories)
  )).orderBy(desc(testSessions.lastActivityAt), testSessions.id)
  return await (limit === undefined ? query : query.limit(limit)) satisfies PracticeExamResume[]
}

export async function getActiveLearningResumes(userId: string, categories: string[], limit = 3) {
  if (!categories.length) return [] satisfies LearningSessionResume[]
  const lastActivityAt = sql<Date>`coalesce(max(${learningPracticeItems.updatedAt}), ${learningPracticeSessions.startedAt})`
    .mapWith(learningPracticeSessions.startedAt)
  return await db.select({
    sessionId: learningPracticeSessions.id,
    category: learningPracticeSessions.category,
    totalQuestions: sql<number>`jsonb_array_length(${learningPracticeSessions.items})`.mapWith(Number),
    completedQuestions: sql<number>`(select coalesce(sum(value::integer), 0)
      from jsonb_each_text(${learningPracticeSessions.summary}))`.mapWith(Number),
    lastActivityAt,
  }).from(learningPracticeSessions)
    .leftJoin(learningPracticeItems, eq(learningPracticeItems.sessionId, learningPracticeSessions.id))
    .where(and(
      eq(learningPracticeSessions.userId, userId),
      eq(learningPracticeSessions.status, 'active'),
      eq(learningPracticeSessions.policyVersion, PRACTICE_POLICY_VERSION),
      inArray(learningPracticeSessions.category, categories)
    ))
    .groupBy(learningPracticeSessions.id)
    .orderBy(desc(lastActivityAt), learningPracticeSessions.id)
    .limit(limit) satisfies LearningSessionResume[]
}
