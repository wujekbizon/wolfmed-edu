import { CATEGORY_METADATA } from '@/constants/categoryMetadata'
import type { CourseSubjectYear } from '@/types/pricingTypes'

const ROMAN_YEARS: Record<string, number> = { I: 1, II: 2, III: 3 }

// "Rok I, Semestr I" and "Rok I-II, Semestr I, III" both belong to year 1 —
// a subject spanning two years is listed under the one it starts in.
function readYear(semester: string): number {
  const roman = semester.match(/Rok ([IVX]+)/)?.[1]
  return (roman && ROMAN_YEARS[roman]) || 0
}

export function getCourseSubjects(courseSlug: string): CourseSubjectYear[] {
  const years = new Map<number, CourseSubjectYear>()

  for (const [category, meta] of Object.entries(CATEGORY_METADATA)) {
    if (meta.course !== courseSlug || !meta.details) continue

    const year = readYear(meta.details.semester)
    if (!years.has(year)) {
      years.set(year, { year, label: `Rok ${'I'.repeat(year)}`, subjects: [] })
    }

    years.get(year)?.subjects.push({
      category,
      title: meta.title ?? category,
      semester: meta.details.semester,
      ects: meta.details.ects,
    })
  }

  return [...years.values()]
    .filter((entry) => entry.year > 0)
    .sort((a, b) => a.year - b.year)
    .map((entry) => ({
      ...entry,
      subjects: entry.subjects.sort((a, b) => a.title.localeCompare(b.title, 'pl')),
    }))
}
