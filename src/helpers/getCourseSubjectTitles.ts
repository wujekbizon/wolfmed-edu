import { CATEGORY_METADATA } from '@/constants/categoryMetadata'

export function getCourseSubjectTitles(courseSlug: string): string[] {
  return Object.entries(CATEGORY_METADATA)
    .filter(([, meta]) => meta.course === courseSlug && meta.details)
    .map(([category, meta]) => meta.title ?? category)
    .sort((a, b) => a.localeCompare(b, 'pl'))
}
