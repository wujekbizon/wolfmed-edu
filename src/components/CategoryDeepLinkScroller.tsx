'use client'

import { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'

const HIGHLIGHT = ['ring-2', 'ring-[#ff9898]', 'ring-offset-2', 'ring-offset-zinc-50']

/**
 * When the tests list is opened with `?kategoria=<value>` (e.g. from the plan
 * dashboard's "Rozwiąż test" button), scroll to that category's card and pulse a
 * highlight. Retries briefly so it still works after the Suspense list mounts.
 */
export default function CategoryDeepLinkScroller() {
  const kategoria = useSearchParams().get('kategoria')

  useEffect(() => {
    if (!kategoria) return

    let attempts = 0
    let cleanupTimer: ReturnType<typeof setTimeout> | undefined

    const tryScroll = () => {
      const el = document.getElementById(`kat-${kategoria}`)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' })
        el.classList.add(...HIGHLIGHT)
        cleanupTimer = setTimeout(() => el.classList.remove(...HIGHLIGHT), 2400)
        return
      }
      if (attempts++ < 20) cleanupTimer = setTimeout(tryScroll, 150)
    }

    tryScroll()
    return () => {
      if (cleanupTimer) clearTimeout(cleanupTimer)
    }
  }, [kategoria])

  return null
}
