import type { PracticeView } from '@/types/learningPracticeTypes'

export function newestPracticeView(previous: PracticeView | null | undefined, next: PracticeView | null) {
  if (!previous) return next
  if (!next) return previous
  if (previous.id === next.id) {
    if (previous.version > next.version) return previous
    if (previous.version === next.version && previous.question?.supportPending === false && next.question?.supportPending) return previous
    if (next.partial) {
      const cards = new Map(previous.cards.map((card) => [card.id, card]))
      for (const card of next.cards) cards.set(card.id, card)
      return { ...next, partial: false, cards: [...cards.values()] }
    }
    return next
  }
  return previous.startedAt > next.startedAt ? previous : next
}
