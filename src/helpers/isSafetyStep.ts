import { SAFETY_KEYWORDS } from '@/constants/orderableSteps'

export function isSafetyStep(text: string): boolean {
  const lower = text.toLowerCase()
  return SAFETY_KEYWORDS.some((keyword) => lower.includes(keyword))
}
