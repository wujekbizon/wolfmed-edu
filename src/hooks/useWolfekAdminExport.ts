'use client'

import { useState } from 'react'
import type { WolfekAdminFilters } from '@/types/wolfekAdminTypes'

export function useWolfekAdminExport(filters: WolfekAdminFilters) {
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')
  const download = async (format: 'csv' | 'json') => {
    setPending(true)
    setError('')
    try {
      const params = new URLSearchParams(Object.entries({ ...filters, format }).map(([key, value]) => [key, String(value)]))
      const response = await fetch(`/api/admin/wolfek/export?${params}`, { cache: 'no-store' })
      if (!response.ok) {
        const payload = await response.json() as { error?: string }
        throw new Error(payload.error ?? 'Eksport nie powiódł się.')
      }
      const url = URL.createObjectURL(await response.blob())
      const link = document.createElement('a')
      link.href = url
      link.download = `wolfek-${filters.view}-${filters.from}-${filters.to}.${format}`
      document.body.appendChild(link)
      link.click()
      link.remove()
      setTimeout(() => URL.revokeObjectURL(url), 1000)
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'Eksport nie powiódł się.')
    } finally { setPending(false) }
  }
  return { pending, error, download }
}
