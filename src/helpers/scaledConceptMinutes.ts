import {
  CONCEPT_DEFAULT_MINUTES,
  TOPIC_DEFAULT_MINUTES,
} from '@/constants/planner'
import type { ConceptCatalogEntry } from '@/types/plannerTypes'

const MIN_SUBJECT_MINUTES = 60
const MAX_SUBJECT_MINUTES = 1800

/**
 * Realistic target minutes for a whole-subject concept, scaled by content
 * size instead of a flat default: a subject with 20 program topics is not a
 * 60-minute task. Falls back to question count, then the flat default.
 */
export function scaledConceptMinutes(entry: ConceptCatalogEntry): number {
  const topicCount = entry.topicGroups.reduce(
    (total, group) => total + group.topics.length,
    0
  )

  if (topicCount > 0) {
    return Math.min(
      MAX_SUBJECT_MINUTES,
      Math.max(MIN_SUBJECT_MINUTES, topicCount * TOPIC_DEFAULT_MINUTES)
    )
  }

  if (entry.questionCount > 0) {
    const estimated = Math.round((entry.questionCount * 1.5) / 5) * 5
    return Math.min(
      MAX_SUBJECT_MINUTES,
      Math.max(MIN_SUBJECT_MINUTES, estimated)
    )
  }

  return CONCEPT_DEFAULT_MINUTES
}
