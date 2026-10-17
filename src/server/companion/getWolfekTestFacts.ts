import 'server-only'
import { eq, sql } from 'drizzle-orm'
import { db } from '@/server/db/index'
import { completedTestes, testSessions } from '@/server/db/schema'
import { getCategoryPerformance, getQuestionAccuracyAnalytics } from '@/server/queries'

export async function getWolfekTestFacts(userId: string) {
  const [totals, categories, difficult] = await Promise.allSettled([
    db.select({ count: sql<number>`count(*)::int`, score: sql<number>`coalesce(sum(${completedTestes.score}), 0)::int`,
      questions: sql<number>`coalesce(sum(${testSessions.numberOfQuestions}), 0)::int` })
      .from(completedTestes).innerJoin(testSessions, eq(completedTestes.sessionId, testSessions.id))
      .where(eq(completedTestes.userId, userId)),
    getCategoryPerformance(userId), getQuestionAccuracyAnalytics(userId),
  ])
  const row = totals.status === 'fulfilled' ? totals.value[0] : null
  const count = row ? Number(row.count) : null
  const wrong = difficult.status === 'fulfilled' ? difficult.value : null
  return {
    completedTestCount: count, hasTests: count === null ? null : count > 0,
    totalQuestions: row ? Number(row.questions) : null, correctAnswers: row ? Number(row.score) : null,
    accuracyText: row ? Number(row.questions) ? `${(Number(row.score) / Number(row.questions) * 100).toFixed(1)}%` : 'brak odpowiedzi' : null,
    difficultQuestionCount: wrong?.length ?? null, hasDifficult: wrong ? wrong.length > 0 : null,
    difficultQuestionsSummary: wrong ? 'Listę pytań i ich skuteczność znajdziesz w szczegółach postępów.' : null,
    reviewSummaryText: wrong ? `Pytania ze skutecznością poniżej 50%: ${wrong.length}.` : null,
    categoryPerformanceText: categories.status === 'fulfilled'
      ? categories.value.map((item) => `${item.category}: ${item.totalTests} testów, ${
        Number.isFinite(Number(item.avgScore)) ? `${item.avgScore}%` : 'brak pytań do oceny'}`).join('; ') : null,
  }
}
