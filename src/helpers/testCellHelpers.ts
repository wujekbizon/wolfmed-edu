import type { DraftQuestion } from '@/components/cells/TestQuestionEditor'

export function parseQuestions(content: string): DraftQuestion[] {
  try {
    const parsed = JSON.parse(content)
    const raw = Array.isArray(parsed) ? parsed : parsed?.questions ?? []
    return raw.filter(
      (q: any) =>
        q?.data?.question &&
        Array.isArray(q?.data?.answers) &&
        q?.meta?.category
    )
  } catch {
    return []
  }
}

export function blankDraft(category: string): DraftQuestion {
  return {
    id: crypto.randomUUID(),
    data: {
      question: '',
      answers: Array(4).fill(null).map(() => ({ option: '', isCorrect: false })),
    },
    meta: { course: 'kategoria-wlasna', category },
  }
}
