'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import ProceduresList from '@/components/ProceduresList'
import ProceduresToolbar from '@/components/ProceduresToolbar'
import {
  PROCEDURE_BROWSE_DEFAULT_CRITERIA,
  PROCEDURE_BROWSE_STALE_TIME,
} from '@/constants/procedureBrowse'
import { filterAndSortProcedures } from '@/helpers/filterAndSortProcedures'
import { pluralizePl } from '@/helpers/pluralizePl'
import { useDebouncedValue } from '@/hooks/useDebounceValue'
import type {
  ProcedureBrowseCriteria,
  ProcedureBrowseItem,
  ProcedureCourse,
} from '@/types/procedureBrowseTypes'

export default function ProceduresBrowser({
  course,
  procedures,
}: {
  course: ProcedureCourse
  procedures: ProcedureBrowseItem[]
}) {
  const [criteria, setCriteria] = useState(PROCEDURE_BROWSE_DEFAULT_CRITERIA)
  const debouncedSearch = useDebouncedValue(criteria.search, 250)
  const effectiveCriteria = { ...criteria, search: debouncedSearch }
  const sourceKey = procedures.map(({ key, name }) => `${key}:${name}`).join('|')
  const onChange = (patch: Partial<ProcedureBrowseCriteria>) =>
    setCriteria((current) => ({ ...current, ...patch }))

  const { data: results } = useQuery({
    queryKey: ['procedures', course, sourceKey, debouncedSearch, criteria.sort],
    queryFn: async () => filterAndSortProcedures(procedures, effectiveCriteria),
    initialData: () => filterAndSortProcedures(procedures, effectiveCriteria),
    staleTime: PROCEDURE_BROWSE_STALE_TIME,
  })

  return (
    <section className='flex flex-col items-center px-1 sm:px-4 py-4 w-full h-full'>
      <div className='w-full h-full overflow-y-auto px-4 pb-4 md:px-6 md:pb-6 scrollbar-webkit'>
        <ProceduresToolbar criteria={criteria} onChange={onChange} />
        <p className='text-xs text-zinc-400 mb-4' aria-live='polite'>
          {results.length === procedures.length
            ? `${procedures.length} ${pluralizePl(procedures.length, ['procedura', 'procedury', 'procedur'])}`
            : `${results.length} z ${procedures.length} procedur`}
        </p>
        <ProceduresList procedures={results} />
      </div>
    </section>
  )
}
