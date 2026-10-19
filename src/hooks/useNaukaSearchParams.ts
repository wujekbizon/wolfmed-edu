'use client'

import { useSyncExternalStore } from 'react'
import { useSearchParams } from 'next/navigation'

export function useNaukaSearchParams() {
  const routerParams = useSearchParams()
  const search = useSyncExternalStore(
    (onChange) => {
      let frame: number | undefined
      const onNavigation = () => {
        if (frame !== undefined) cancelAnimationFrame(frame)
        frame = requestAnimationFrame(onChange)
      }
      window.addEventListener('popstate', onNavigation)
      window.addEventListener('nauka-navigation', onNavigation)
      window.navigation?.addEventListener('currententrychange', onNavigation)
      return () => {
        if (frame !== undefined) cancelAnimationFrame(frame)
        window.removeEventListener('popstate', onNavigation)
        window.removeEventListener('nauka-navigation', onNavigation)
        window.navigation?.removeEventListener('currententrychange', onNavigation)
      }
    },
    () => window.location.search,
    () => `?${routerParams.toString()}`,
  )

  return new URLSearchParams(search)
}
