'use client'

import { useState } from 'react'
import { downloadBrowserFile } from '@/helpers/downloadBrowserFile'
import type { StripeReport } from '@/types/stripeReportTypes'

export function useStripeReportDownload(report: StripeReport) {
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')
  async function download() {
    setPending(true)
    setError('')
    try {
      const query = new URLSearchParams({ month: report.period.month, fingerprint: report.fingerprint })
      const response = await fetch(`/api/admin/stripe-reports/pdf?${query}`, { cache: 'no-store' })
      if (!response.ok) throw new Error(response.status === 409
        ? 'Dane zmieniły się. Odśwież raport przed pobraniem PDF.'
        : 'Nie udało się wygenerować PDF. Spróbuj ponownie.')
      const password = response.headers.get('X-Report-Password')
      if (!password) throw new Error('Brak hasła raportu.')
      const base = `Zestawienie_transakcji_Stripe_${report.period.month}`
      downloadBrowserFile(await response.blob(), `${base}.pdf`)
      downloadBrowserFile(
        new Blob([`Hasło do raportu ${report.period.month}: ${password}\n`], { type: 'text/plain;charset=utf-8' }),
        `Haslo_${base}.txt`
      )
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Błąd pobierania PDF.')
    } finally {
      setPending(false)
    }
  }
  return { download, pending, error }
}
