import type { LearningQuestionCardData, PracticeCardProgress, PracticeView } from '@/types/learningPracticeTypes'

export function buildPracticeCardView(
  category: string, question: LearningQuestionCardData, index: number, total: number,
  session: PracticeView | null, progress: PracticeCardProgress | undefined,
): PracticeView {
  return {
    id: session?.id ?? '', category, startedAt: session?.startedAt ?? '',
    version: session?.version ?? 0, index, total, status: session?.status ?? 'active',
    cards: session?.cards ?? [],
    summary: session?.summary ?? { unassisted: 0, assisted: 0, revealed: 0, skipped: 0, invalid: 0 },
    question: {
      id: question.id, revision: question.revision, text: question.question, options: question.options,
      selected: progress?.selected ?? null, correct: progress?.correct ?? null,
      correctIndex: progress?.correctIndex ?? null, attempts: progress?.attempts ?? 0,
      hintOpened: progress?.hintOpened ?? false,
      resolved: progress?.resolved ?? false, invalid: !question.practiceable || progress?.invalid === true,
      hint: progress?.hint ?? null, explanation: progress?.explanation ?? null,
      attemptId: progress?.attemptId ?? null,
      supportPending: session?.question?.id === question.id && session.question.supportPending,
      suggestedAction: progress?.suggestedAction ?? null,
      suggestedTarget: progress?.suggestedTarget ?? null,
      suggestedEventId: progress?.suggestedEventId ?? null,
    },
  }
}
