import type { PracticeItem } from '@/types/learningPracticeTypes'

export function clearPracticeItem(item: PracticeItem): PracticeItem {
  const { correctIndex: _key, learningEventId: _event, support: _support, ...preserved } = item
  return {
    ...preserved,
    attempts: [],
    hintOpened: false,
    revealed: false,
    priorExposure: item.priorExposure || item.hintOpened || item.revealed || item.attempts.length > 0,
    version: 0,
    outcome: null,
  }
}

