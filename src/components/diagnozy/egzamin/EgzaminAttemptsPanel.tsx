'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { History } from 'lucide-react'
import { useDebouncedValue } from '@/hooks/useDebounceValue'
import Card from '@/components/ui/Card'
import EgzaminAttemptsStats from '@/components/diagnozy/egzamin/EgzaminAttemptsStats'
import EgzaminAttemptsToolbar from '@/components/diagnozy/egzamin/EgzaminAttemptsToolbar'
import EgzaminAttemptsList from '@/components/diagnozy/egzamin/EgzaminAttemptsList'
import { filterAndSortExamAttempts } from '@/helpers/filterAndSortExamAttempts'
import { getExamAttemptStats } from '@/helpers/getExamAttemptStats'
import { ATTEMPTS_PREVIEW_COUNT } from '@/constants/examAttempts'
import type { DiagnozyExamAttempt, ExamAttemptCriteria } from '@/types/diagnozyTypes'

const DEFAULT_CRITERIA: ExamAttemptCriteria = {
  search: '',
  status: 'all',
  sort: 'date-desc',
}

export default function EgzaminAttemptsPanel({
  attempts,
  titlesBySlug,
}: {
  attempts: DiagnozyExamAttempt[]
  titlesBySlug: Record<string, string>
}) {
  const [criteria, setCriteria] = useState<ExamAttemptCriteria>(DEFAULT_CRITERIA)
  const [expanded, setExpanded] = useState(false)
  const debouncedSearch = useDebouncedValue(criteria.search, 250)
  const effectiveCriteria = { ...criteria, search: debouncedSearch }

  const { data: results } = useQuery({
    queryKey: [
      'examAttempts',
      attempts.length,
      debouncedSearch,
      criteria.status,
      criteria.sort,
    ],
    queryFn: async () =>
      filterAndSortExamAttempts(attempts, titlesBySlug, effectiveCriteria),
    initialData: () =>
      filterAndSortExamAttempts(attempts, titlesBySlug, effectiveCriteria),
    staleTime: 10 * 60 * 1000,
  })

  if (attempts.length === 0) return null

  const filtering = criteria.status !== 'all' || debouncedSearch !== ''
  const visible = expanded || filtering ? results : results.slice(0, ATTEMPTS_PREVIEW_COUNT)
  const hidden = results.length - visible.length

  return (
    <Card className="mt-8 divide-y divide-zinc-900/[0.06]">
      <div className="p-4 flex items-center gap-2">
        <History className="w-4 h-4 text-zinc-400" />
        <h2 className="text-sm font-semibold text-zinc-700">Historia podejść</h2>
      </div>

      <div className="p-4">
        <EgzaminAttemptsStats stats={getExamAttemptStats(attempts)} />
      </div>

      <div className="p-4">
        <EgzaminAttemptsToolbar
          criteria={criteria}
          onChange={(patch) => setCriteria((prev) => ({ ...prev, ...patch }))}
        />
      </div>

      <div className="px-4">
        <EgzaminAttemptsList attempts={visible} titlesBySlug={titlesBySlug} />
      </div>

      {hidden > 0 && (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="w-full p-3 text-xs font-medium text-zinc-500 hover:text-zinc-700
            hover:bg-zinc-50/70 transition-colors cursor-pointer rounded-b-2xl"
        >
          Pokaż wszystkie ({results.length})
        </button>
      )}
    </Card>
  )
}
