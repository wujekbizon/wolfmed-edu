import 'server-only'
import { toPracticeCardProgress } from '@/helpers/toPracticeCardProgress'
import { loadPracticeQuestion } from './loadQuestion'
import { getJevConfig } from './jevConfig'
import { getPracticeCoachingEvidence } from './getPracticeCoachingEvidence'
import { getPracticeItem, getPracticeItemRows } from './getPracticeItems'
import type { PracticeSession, PracticeTransaction } from '@/types/learningPracticeServerTypes'
import type { PracticeView } from '@/types/learningPracticeTypes'

export async function buildPracticeView(
  tx: PracticeTransaction, session: PracticeSession, questionId?: string, partial = false,
  pendingEventId?: string,
): Promise<PracticeView> {
  const selected = questionId ? await getPracticeItem(tx, session, questionId) : null
  const savedRows = partial ? selected ? [{ item: selected.item }] : [] : await getPracticeItemRows(tx, session.id)
  const saved = new Map(savedRows.map(({ item }) => [item.id, item]))
  const cards = [...saved.values()].map((item) => toPracticeCardProgress(item, session.catalogVersion))
  if (!partial) for (const item of session.items) {
    if (!saved.has(item.id) && (item.priorExposure || item.outcome || item.attempts.length || item.hintOpened)) {
      cards.push(toPracticeCardProgress(item, session.catalogVersion))
    }
  }
  const questionIndex = selected?.position ?? session.activeIndex
  const view: PracticeView = {
    id: session.id, partial, category: session.category, version: session.version,
    startedAt: session.startedAt.toISOString(), index: questionIndex,
    total: session.items.length, status: session.status, cards, summary: session.summary,
    question: null,
  }
  if (session.status !== 'active') return view
  const current = selected ?? await getPracticeItem(tx, session)
  if (!current) return view
  const item = current.item
  const question = await loadPracticeQuestion(tx, item.id, session.category)
  const invalid = !question || question.revision !== item.revision
  const last = item.attempts.at(-1)
  const progress = toPracticeCardProgress(item, session.catalogVersion)
  const showKey = item.revealed || last?.correct === true
  const firstWrong = item.outcome === null && item.attempts.length === 1 && last?.correct === false
  const revealed = item.outcome === 'revealed' && item.revealed
  const pendingTrigger = !invalid && !!getJevConfig() && (firstWrong || revealed) &&
    item.support?.trigger !== item.learningEventId
  const supportPending = pendingTrigger && !!await getPracticeCoachingEvidence(
    tx, session.id, item, pendingEventId === item.learningEventId)
  view.question = {
    id: item.id, revision: item.revision,
    text: invalid ? 'To pytanie zostało zmienione lub usunięte. Pomiń je i rozpocznij nową sesję, aby pobrać aktualne pytania.' : question.data.question,
    options: invalid ? [] : question.data.answers.map((answer) => answer.option),
    selected: last?.selected ?? null, correct: last?.correct ?? null,
    correctIndex: !invalid && showKey
      ? item.correctIndex ?? question.data.answers.findIndex((answer) => answer.isCorrect) : null,
    attempts: item.attempts.length, hintOpened: item.hintOpened, resolved: item.outcome !== null, invalid,
    hint: !invalid && item.hintOpened ? progress.hint : null,
    explanation: showKey ? progress.explanation : null,
    attemptId: last?.eventId ?? null,
    supportPending,
    suggestedAction: progress.suggestedAction,
    suggestedTarget: progress.suggestedTarget,
    suggestedEventId: progress.suggestedEventId,
  }
  return view
}
