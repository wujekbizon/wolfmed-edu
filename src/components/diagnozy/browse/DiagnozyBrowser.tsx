'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useDebouncedValue } from '@/hooks/useDebounceValue'
import DiagnozyToolbar from '@/components/diagnozy/browse/DiagnozyToolbar'
import DiagnozyResults from '@/components/diagnozy/browse/DiagnozyResults'
import { filterAndSortDiagnozy } from '@/helpers/filterAndSortDiagnozy'
import { getDiagnozyChapters } from '@/helpers/getDiagnozyChapters'
import type { DiagnozaListItem, DiagnozyBrowseCriteria } from '@/types/diagnozyTypes'

const DEFAULT_CRITERIA: DiagnozyBrowseCriteria = {
  search: '',
  chapter: '',
  status: 'all',
  sort: 'section-asc',
}

export default function DiagnozyBrowser({
  diagnozy,
  completedSlugs,
}: {
  diagnozy: DiagnozaListItem[]
  completedSlugs: string[]
}) {
  const [criteria, setCriteria] = useState<DiagnozyBrowseCriteria>(DEFAULT_CRITERIA)
  const onChange = (patch: Partial<DiagnozyBrowseCriteria>) =>
    setCriteria((prev) => ({ ...prev, ...patch }))

  const debouncedSearch = useDebouncedValue(criteria.search, 250)
  const effectiveCriteria = { ...criteria, search: debouncedSearch }

  const { data: chapters } = useQuery({
    queryKey: ['diagnozyChapters', diagnozy.length],
    queryFn: async () => getDiagnozyChapters(diagnozy),
    initialData: () => getDiagnozyChapters(diagnozy),
    staleTime: 10 * 60 * 1000,
  })

  const { data: results } = useQuery({
    queryKey: [
      'diagnozy',
      diagnozy.length,
      completedSlugs.length,
      debouncedSearch,
      criteria.chapter,
      criteria.status,
      criteria.sort,
    ],
    queryFn: async () => filterAndSortDiagnozy(diagnozy, completedSlugs, effectiveCriteria),
    initialData: () => filterAndSortDiagnozy(diagnozy, completedSlugs, effectiveCriteria),
    staleTime: 10 * 60 * 1000,
  })

  const grouped = criteria.sort === 'section-asc' || criteria.sort === 'section-desc'

  return (
    <div>
      <DiagnozyToolbar criteria={criteria} chapters={chapters} onChange={onChange} />

      <p className="text-xs text-zinc-400 mb-4" aria-live="polite">
        {results.length === diagnozy.length
          ? `${diagnozy.length} diagnoz`
          : `${results.length} z ${diagnozy.length} diagnoz`}
      </p>

      <DiagnozyResults
        results={results}
        completedSlugs={completedSlugs}
        grouped={grouped}
      />
    </div>
  )
}
