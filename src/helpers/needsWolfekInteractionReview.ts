import { WOLFEK_TOPIC_MIN_CONFIDENCE } from '@/constants/wolfekRouting'
import type { WolfekInteraction } from '@/types/wolfekMetricTypes'

export function needsWolfekInteractionReview(record: WolfekInteraction) {
  return record.kind === 'question' &&
    (record.topic === 'other' || record.topic === 'no_match' || record.topic === 'clarify' ||
      record.topic?.startsWith('unavailable_') === true ||
      (record.outcome !== 'prepared' && (record.confidence === null || record.confidence < WOLFEK_TOPIC_MIN_CONFIDENCE)))
}
