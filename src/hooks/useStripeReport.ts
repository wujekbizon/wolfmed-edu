'use client'

import { useEffect } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { STRIPE_REPORT_STALE_TIME, STRIPE_REPORT_TIMEZONE } from '@/constants/stripeReports'
import type { StripeReport } from '@/types/stripeReportTypes'

export function useStripeReport(report: StripeReport, userId: string) {
  const client = useQueryClient()
  const month = report.period.month
  const mode = report.livemode
  useEffect(() => () => {
    client.removeQueries({ queryKey: ['stripe-report', userId, month, mode, STRIPE_REPORT_TIMEZONE] })
  }, [client, userId, month, mode])
  return useQuery({
    queryKey: ['stripe-report', userId, month, mode, STRIPE_REPORT_TIMEZONE],
    initialData: report,
    initialDataUpdatedAt: report.generatedAt * 1000,
    staleTime: STRIPE_REPORT_STALE_TIME,
    gcTime: 0, retry: false, refetchOnWindowFocus: false, refetchOnMount: false,
    queryFn: async ({ signal }): Promise<StripeReport> => {
      const response = await fetch(`/api/admin/stripe-reports?month=${month}`, { cache: 'no-store', signal })
      if (!response.ok) throw new Error('Nie udało się odświeżyć raportu.')
      return response.json()
    },
  })
}
