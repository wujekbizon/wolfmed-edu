import 'server-only'
import { cache } from 'react'
import { CATEGORY_METADATA } from '@/constants/categoryMetadata'
import { EXAM_PERIODS } from '@/constants/examDates'
import { createPolandDate } from '@/utils/dateUtils'
import { countTestsByCategory } from '@/server/queries'
import type {
  ConceptCatalogEntry,
  ConceptTopicGroup,
  ExamDatePreset,
} from '@/types/plannerTypes'

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
      const program = meta.details?.programContent

      // Section labels mirror ProgramContentSection on /panel/kursy/[categoryId]
      const topicGroups: ConceptTopicGroup[] = program
        ? (
            [
              { key: 'lectures', label: 'Podstawy teoretyczne', topics: program.lectures },
              { key: 'seminars', label: 'Praktyczne zastosowanie', topics: program.seminars },
              { key: 'selfStudy', label: 'Wiedza rozszerzona', topics: program.selfStudy },
            ] as ConceptTopicGroup[]
          ).filter((group) => group.topics.length > 0)
        : []

      return {
        categoryKey: key,
        label: categoryLabel(key),
        questionCount: counts[i] ?? 0,
        topicGroups,
      }
    })
  }
)

function opiekunMedycznyPresets(limit: number): ExamDatePreset[] {
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

/**
 * University session windows differ per uczelnia, so pielęgniarstwo gets
 * approximate presets ("orientacyjnie") — the due date stays editable.
 */
function pielegniarstwoPresets(limit: number): ExamDatePreset[] {
  const now = Date.now()
  const currentYear = new Date().getFullYear()
  const presets: ExamDatePreset[] = []

  for (let year = currentYear; year <= currentYear + 2; year++) {
    presets.push(
      {
        label: `Sesja zimowa ${year} (orientacyjnie)`,
        dateISO: createPolandDate(year, 2, 5, 8).toISOString(),
      },
      {
        label: `Sesja letnia ${year} (orientacyjnie)`,
        dateISO: createPolandDate(year, 6, 15, 8).toISOString(),
      }
    )
  }

  return presets
    .filter((preset) => new Date(preset.dateISO).getTime() > now)
    .slice(0, limit)
}

/**
 * Upcoming exam sessions usable as due-date presets, per course:
 * opiekun-medyczny has centrally set state-exam dates, pielęgniarstwo gets
 * approximate university session windows.
 */
export function getExamDatePresets(courseSlug: string, limit = 3): ExamDatePreset[] {
  if (courseSlug === 'opiekun-medyczny') return opiekunMedycznyPresets(limit)
  if (courseSlug === 'pielegniarstwo') return pielegniarstwoPresets(limit)
  return []
}
