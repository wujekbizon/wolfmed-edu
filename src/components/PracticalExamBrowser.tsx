'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import PracticalExamCard from '@/components/PracticalExamCard'
import PracticalExamToolbar from '@/components/PracticalExamToolbar'
import { useDebouncedValue } from '@/hooks/useDebounceValue'
import { filterAndSortPracticalExams } from '@/helpers/filterAndSortPracticalExams'
import { PRACTICAL_EXAM_BROWSE_DEFAULTS, PRACTICAL_EXAM_BROWSE_STALE_TIME } from '@/constants/practicalExamBrowse'
import type { PracticalExamBrowserProps, PracticalExamBrowseCriteria } from '@/types/practicalExamBrowseTypes'

export default function PracticalExamBrowser({ exams }: PracticalExamBrowserProps) {
  const [criteria, setCriteria] = useState(PRACTICAL_EXAM_BROWSE_DEFAULTS)
  const search = useDebouncedValue(criteria.search, 250)
  const effective = { ...criteria, search }
  const years = [...new Set(exams.map((exam) => exam.year))].sort((a, b) => b - a)
  const { data: results } = useQuery({
    queryKey: ['practicalExamBrowse', exams, search, criteria.year, criteria.sort],
    queryFn: async () => filterAndSortPracticalExams(exams, effective),
    initialData: () => filterAndSortPracticalExams(exams, effective),
    staleTime: PRACTICAL_EXAM_BROWSE_STALE_TIME,
  })
  const onChange = (patch: Partial<PracticalExamBrowseCriteria>) => setCriteria((current) => ({ ...current, ...patch }))

  return (
    <div id='practical-exam-sessions' className='flex flex-col gap-4 md:gap-8'>
      <PracticalExamToolbar criteria={criteria} years={years} onChange={onChange} />
      <p aria-live='polite' className='text-xs text-zinc-500'>Arkusze: {results.length} z {exams.length}</p>
      {results.map((exam) => <PracticalExamCard key={exam.id} variant='exam' exam={exam} />)}
      {results.length === 0 && <p className='rounded-2xl border border-zinc-200 bg-white p-6 text-sm text-zinc-600'>Brak arkuszy pasujących do filtrów. Zmień rok lub wyszukiwane hasło.</p>}
    </div>
  )
}
