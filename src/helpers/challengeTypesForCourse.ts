import { ChallengeType } from '@/types/challengeTypes'

// Opiekun-medyczny procedures (flat algorithm) support the deterministic
// order-steps game plus the 3 AI challenges. Pielęgniarstwo procedures use
// scored sections — ordering 30+ steps is poor UX, so they get the 3 AI
// challenges only. The badge for a course requires all of its types.
const OPIEKUN_TYPES: ChallengeType[] = [
  ChallengeType.ORDER_STEPS,
  ChallengeType.KNOWLEDGE_QUIZ,
  ChallengeType.SPOT_ERROR,
  ChallengeType.SCENARIO_BASED,
]

const PIELEGNIARSTWO_TYPES: ChallengeType[] = [
  ChallengeType.KNOWLEDGE_QUIZ,
  ChallengeType.SPOT_ERROR,
  ChallengeType.SCENARIO_BASED,
]

export function challengeTypesForCourse(course: string): ChallengeType[] {
  return course === 'pielegniarstwo' ? PIELEGNIARSTWO_TYPES : OPIEKUN_TYPES
}
