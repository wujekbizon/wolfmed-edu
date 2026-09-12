'use client'

import { useEffect, useState } from 'react'

export function useAuthSceneEnabled() {
  const [enabled, setEnabled] = useState(false)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const media = window.matchMedia('(min-width: 768px) and (prefers-reduced-motion: no-preference)')
    const updateMedia = () => setEnabled(media.matches)
    const updateVisibility = () => setVisible(!document.hidden)
    updateMedia()
    updateVisibility()
    media.addEventListener('change', updateMedia)
    document.addEventListener('visibilitychange', updateVisibility)
    return () => {
      media.removeEventListener('change', updateMedia)
      document.removeEventListener('visibilitychange', updateVisibility)
    }
  }, [])

  return { enabled, visible }
}
