import type { PublicExam } from '@/types/praktycznyTypes'
import type { PracticalExamBrowseCriteria } from '@/types/practicalExamBrowseTypes'

export function filterAndSortPracticalExams(exams: PublicExam[], criteria: PracticalExamBrowseCriteria) {
  const search = criteria.search.trim().toLocaleLowerCase('pl-PL')
  const results = exams.filter((exam) =>
    (criteria.year === 'all' || String(exam.year) === criteria.year) &&
    `${exam.title} ${exam.session} ${exam.year} ${exam.arkusz}`.toLocaleLowerCase('pl-PL').includes(search),
  )
  if (criteria.sort === 'newest') results.sort((a, b) => b.year - a.year)
  if (criteria.sort === 'oldest') results.sort((a, b) => a.year - b.year)
  if (criteria.sort === 'title') results.sort((a, b) => a.title.localeCompare(b.title, 'pl'))
  return results
}
