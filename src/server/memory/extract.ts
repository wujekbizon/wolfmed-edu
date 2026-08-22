import 'server-only'
import { and, desc, eq } from 'drizzle-orm'
import { db } from '@/server/db/index'
import { completedTestes, testSessions } from '@/server/db/schema'
import { promoteFact } from './gate'
import { insertEpisode } from './stores/episodes'
import { embedDocument } from '@/server/embeddings'

// Deterministic extraction — no LLM, $0, zero poisoning risk. Product events are
// the highest-recall fact source for the things that matter (weakness/mastery).

const RECENT_WINDOW = 3
const WEAK_PCT = 65
const STRONG_PCT = 85

type QuizLevel = 'weak' | 'ok' | 'strong'

function levelFor(avgPct: number): QuizLevel {
  if (avgPct < WEAK_PCT) return 'weak'
  if (avgPct >= STRONG_PCT) return 'strong'
  return 'ok'
}

function factContent(category: string, level: QuizLevel, avgPct: number, attempts: number, date: string): string {
  const window = `średnio ${avgPct}% w ${attempts} ostatnich podejściach (stan na ${date})`
  if (level === 'weak') return `Słabe wyniki w kategorii "${category}": ${window}.`
  if (level === 'strong') return `Dobre opanowanie kategorii "${category}": ${window}.`
  return `Przeciętne wyniki w kategorii "${category}": ${window}.`
}

async function safeEmbed(text: string): Promise<number[] | null> {
  try {
    return await embedDocument(text)
  } catch {
    return null // EmbeddingUnavailable — fact survives without a vector (Path B cascades)
  }
}

// Runs AFTER a quiz is committed (call from `after()` off the hot path). Recomputes
// the per-category performance fact from the recent score window and supersedes the
// prior one (so a weak fact clears when the student improves), and logs an episode.
// Never throws — post-response work must not surface to the student.
export async function onQuizCompleted(params: {
  userId: string
  sessionId: string
  category: string
}): Promise<void> {
  const { userId, sessionId, category } = params
  try {
    const rows = await db
      .select({
        score: completedTestes.score,
        total: testSessions.numberOfQuestions,
      })
      .from(completedTestes)
      .innerJoin(testSessions, eq(completedTestes.sessionId, testSessions.id))
      .where(and(eq(completedTestes.userId, userId), eq(testSessions.category, category)))
      .orderBy(desc(completedTestes.completedAt))
      .limit(RECENT_WINDOW)

    if (rows.length === 0) return

    const pcts = rows.map((r) => (r.total > 0 ? (r.score / r.total) * 100 : 0))
    const avgPct = Math.round(pcts.reduce((a, b) => a + b, 0) / pcts.length)
    const currentPct = Math.round(pcts[0] ?? 0)
    const level = levelFor(avgPct)
    const date = new Date().toISOString().slice(0, 10)

    // Per-category performance fact — one slot per category, superseded each event.
    const content = factContent(category, level, avgPct, rows.length, date)
    await promoteFact({
      userId,
      subject: 'student',
      predicate: 'quiz_performance',
      content,
      source: 'quiz_derived',
      sourceRunId: `quiz:${sessionId}`,
      confidence: 1,
      factKey: `quiz:${category}`,
      metadata: { category, level, avgPct, attempts: rows.length },
      embedding: await safeEmbed(content),
    })

    // Episode — the accumulating history ("ostatnio: quiz z ..., wynik X%").
    const summary = `Ukończono quiz z kategorii "${category}" — wynik ${currentPct}%.`
    await insertEpisode({
      userId,
      taskType: 'quiz',
      title: `Quiz: ${category}`,
      summary,
      outcome: level,
      sourceRunId: `quiz:${sessionId}`,
      artifacts: { sessionId, category, currentPct },
      embedding: await safeEmbed(summary),
    })
  } catch (error) {
    console.error('[memory] onQuizCompleted failed:', error)
  }
}
