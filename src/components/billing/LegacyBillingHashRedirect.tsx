'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function LegacyBillingHashRedirect() {
  const router = useRouter()

  useEffect(() => {
    if (window.location.hash === '#platnosci') {
      router.replace('/panel#platnosci')
    }
  }, [router])

  return null
}
