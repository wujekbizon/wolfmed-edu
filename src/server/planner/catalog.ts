import 'server-only'
import { cache } from 'react'
import { CATEGORY_METADATA } from '@/constants/categoryMetadata'
import { EXAM_PERIODS } from '@/constants/examDates'
import { countTestsByCategory } from '@/server/queries'
import type { ConceptCatalogEntry, ExamDatePreset } from '@/types/plannerTypes'

function categoryLabel(key: string): string {
  const meta = CATEGORY_METADATA[key]
  if (meta?.title) return meta.title
  return key
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

/**
 * Builds the concept picker catalog for a course from CATEGORY_METADATA,
 * with question counts and expandable curriculum topics.
 */
export const getConceptCatalog = cache(
  async (courseSlug: string): Promise<ConceptCatalogEntry[]> => {
    const categoryKeys = Object.keys(CATEGORY_METADATA).filter(
      (key) => CATEGORY_METADATA[key]?.course === courseSlug
    )

    const counts = await Promise.all(
      categoryKeys.map((key) => countTestsByCategory(key))
    )

    return categoryKeys.map((key, i) => {
      const meta = CATEGORY_METADATA[key]!
      const topics = meta.details?.programContent
        ? [
            ...meta.details.programContent.lectures,
            ...meta.details.programContent.seminars,
          ].slice(0, 20)
        : []

      return {
        categoryKey: key,
        label: categoryLabel(key),
        questionCount: counts[i] ?? 0,
        topics,
      }
    })
  }
)

/**
 * Upcoming state-exam sessions usable as due-date presets
 * (relevant for the opiekun-medyczny course).
 */
export function getExamDatePresets(limit = 3): ExamDatePreset[] {
  const now = Date.now()
  return EXAM_PERIODS.filter(
    (period) => period.type === 'in_progress' && period.startDate.getTime() > now
  )
    .slice(0, limit)
    .map((period) => ({
      label: period.label.replace('Trwa ', '').trim(),
      dateISO: period.startDate.toISOString(),
    }))
}
