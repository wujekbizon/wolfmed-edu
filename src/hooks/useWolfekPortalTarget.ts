'use client'

import { useEffect, useState, useSyncExternalStore } from 'react'

export function useWolfekPortalTarget(inlineAnchorId: string | undefined) {
  const [host] = useState(() => inlineAnchorId && typeof document !== 'undefined' ? document.createElement('div') : null)
  const inline = useSyncExternalStore(
    (onChange) => {
      const media = window.matchMedia('(max-width: 1024px)')
      media.addEventListener('change', onChange)
      return () => media.removeEventListener('change', onChange)
    },
    () => Boolean(inlineAnchorId && window.matchMedia('(max-width: 1024px)').matches),
    () => false,
  )

  useEffect(() => {
    if (!host) return
    const target = inline && inlineAnchorId ? document.getElementById(inlineAnchorId) : document.body
    target?.appendChild(host)
    return () => host.remove()
  }, [host, inline, inlineAnchorId])

  return { host, inline }
}
