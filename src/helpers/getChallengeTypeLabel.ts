import { ChallengeType, CHALLENGE_TYPE_LABELS } from '@/types/challengeTypes'

export function getChallengeTypeLabel(challengeType: string): string {
  return CHALLENGE_TYPE_LABELS[challengeType as ChallengeType] ?? challengeType
}
