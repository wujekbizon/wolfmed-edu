'use client'

import { useEffect, useRef, useSyncExternalStore } from 'react'
import { createPortal } from 'react-dom'
import WolfekAvatar from './WolfekAvatar'
import type { NaukaWolfekLauncherProps } from '@/types/naukaLayoutTypes'

export default function NaukaWolfekLauncher({ onOpen, controlsId = 'nauka-wolfek-welcome' }: NaukaWolfekLauncherProps) {
  const mounted = useSyncExternalStore(() => () => {}, () => true, () => false)
  const launcher = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (mounted) launcher.current?.focus({ preventScroll: true })
  }, [mounted])

  if (!mounted) return null

  return createPortal(
    <div className='wolfek-overlay' data-variant='panel'>
      <div className='wolfek-launcher-tooltip'>
        <button
          ref={launcher}
          type='button'
          className='wolfek-launcher'
          aria-label='Otwórz Wolfka'
          aria-controls={controlsId}
          aria-expanded={false}
          onClick={onOpen}
        >
          <WolfekAvatar positive excited supportive interactive={false} />
        </button>
      </div>
    </div>,
    document.body,
  )
}
