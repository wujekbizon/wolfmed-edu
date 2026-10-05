import type { PracticeItem } from '@/types/learningPracticeTypes'

export function toPracticeBaseItem(item: PracticeItem): PracticeItem {
  return {
    id: item.id,
    revision: item.revision,
    attempts: [],
    hintOpened: false,
    revealed: false,
    priorExposure: item.priorExposure,
    version: 0,
    outcome: null,
  }
}

