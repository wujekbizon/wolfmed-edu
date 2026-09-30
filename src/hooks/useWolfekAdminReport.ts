'use client'

import { useState } from 'react'
import { useQuery, keepPreviousData } from '@tanstack/react-query'
import { useDebouncedValue } from '@/hooks/useDebounceValue'
import { getAdminWolfekReportAction } from '@/actions/wolfek-admin'
import { WOLFEK_ADMIN_STALE_TIME } from '@/constants/wolfekAdmin'
import type { WolfekAdminFilters, WolfekAdminReport } from '@/types/wolfekAdminTypes'

export function useWolfekAdminReport(userId: string, initialFilters: WolfekAdminFilters, initialReport: WolfekAdminReport) {
  const [filters, setFilters] = useState(initialFilters)
  const search = useDebouncedValue(filters.search, 350)
  const effective = { ...filters, search }
  const query = useQuery({
    queryKey: ['wolfek-admin', userId, effective],
    queryFn: () => getAdminWolfekReportAction(effective),
    initialData: JSON.stringify(effective) === JSON.stringify(initialFilters) ? initialReport : undefined,
    placeholderData: keepPreviousData, staleTime: WOLFEK_ADMIN_STALE_TIME, retry: false,
  })
  const change = (patch: Partial<WolfekAdminFilters>) => setFilters((current) => ({ ...current, ...patch, page: 1 }))
  return { filters, effective, query, change, setPage: (page: number) => setFilters((current) => ({ ...current, page })) }
}
