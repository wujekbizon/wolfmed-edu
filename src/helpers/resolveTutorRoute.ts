import type { TutorIntentResult, TutorRoute } from '@/types/memoryTypes'

export function resolveTutorRoute(result: TutorIntentResult): TutorRoute {
  if (result.status === 'unavailable') return 'rag'
  if (result.classification.intent === 'self_state') return 'memory'
  if (result.classification.intent === 'ambiguous') return 'clarify'
  return 'rag'
}
