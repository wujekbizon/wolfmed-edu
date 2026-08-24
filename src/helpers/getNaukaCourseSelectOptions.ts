import {
  CUSTOM_CATEGORIES_FILTER,
  NAUKA_COURSE_LABELS,
} from '@/constants/naukaCategoriesBrowse'
import type { NaukaCategoryBrowseItem } from '@/types/categoryType'
import type { SelectOption } from '@/types/uiTypes'

export function getNaukaCourseSelectOptions(
  categories: NaukaCategoryBrowseItem[]
): SelectOption[] {
  const courses = Array.from(
    new Set(categories.flatMap((item) => item.course ? [item.course] : []))
  ).sort((a, b) =>
    (NAUKA_COURSE_LABELS[a] ?? a).localeCompare(NAUKA_COURSE_LABELS[b] ?? b, 'pl')
  )

  return [
    { value: '', label: 'Wszystkie kursy' },
    ...courses.map((course) => ({
      value: course,
      label: NAUKA_COURSE_LABELS[course] ?? course.replaceAll('-', ' '),
    })),
    { value: CUSTOM_CATEGORIES_FILTER, label: 'Moje kategorie' },
  ]
}
