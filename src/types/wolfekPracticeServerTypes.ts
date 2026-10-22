import type { PracticeItem } from './learningPracticeTypes'
import type { TestData } from './dataTypes'
import type { WolfekPracticeReference } from './wolfekResponseTypes'
import type { WolfekGeneratedHelp } from './wolfekLearningTypes'
import type { getReviewedPracticeSupport } from '@/helpers/getReviewedPracticeSupport'

export type WolfekPracticeCardSnapshot = {
  item: PracticeItem
  question: TestData
  support: ReturnType<typeof getReviewedPracticeSupport>
}

export type WolfekPracticeCardReader = (ref: WolfekPracticeReference) => Promise<WolfekPracticeCardSnapshot>

export type WolfekGeneratedHelpResult = {
  help: WolfekGeneratedHelp
  cache?: () => Promise<void>
}
