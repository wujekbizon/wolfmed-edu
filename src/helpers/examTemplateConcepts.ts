import { TOPIC_DEFAULT_MINUTES } from '@/constants/planner'
import { scaledConceptMinutes } from '@/helpers/scaledConceptMinutes'
import type { ConceptCatalogEntry, SelectedConcept } from '@/types/plannerTypes'

const MIN_SECTION_MINUTES = 60
const MAX_SECTION_MINUTES = 1800

function sectionMinutes(topicCount: number): number {
  return Math.min(
    MAX_SECTION_MINUTES,
    Math.max(MIN_SECTION_MINUTES, topicCount * TOPIC_DEFAULT_MINUTES)
  )
}

/**
 * Concepts added by "Wypełnij planem egzaminacyjnym". A single-subject course
 * (e.g. opiekun-medyczny) is one catalog entry that IS the whole exam, so a
 * flat single concept can't be budgeted per topic. In that case break it into
 * its program sections (Podstawy teoretyczne, Wiedza rozszerzona…), each with a
 * time budget scaled by how many topics it holds. Multi-subject courses keep
 * one concept per subject.
 */
export function buildExamTemplateConcepts(
  catalog: ConceptCatalogEntry[]
): SelectedConcept[] {
  const single = catalog.length === 1 ? catalog[0] : null
  if (single && single.topicGroups.length > 0) {
    return single.topicGroups.map((group) => ({
      categoryKey: single.categoryKey,
      label: group.label,
      source: 'category',
      targetMinutes: sectionMinutes(group.topics.length),
    }))
  }

  return catalog.map((entry) => ({
    categoryKey: entry.categoryKey,
    label: entry.label,
    source: 'category',
    targetMinutes: scaledConceptMinutes(entry),
  }))
}
