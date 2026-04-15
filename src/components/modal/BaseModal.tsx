'use client'

import { useEffect } from 'react'

type ModalSize = 'sm' | 'md' | 'lg' | 'xl'

const sizeClasses: Record<ModalSize, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-2xl',
}

const smSizeClasses: Record<ModalSize, string> = {
  sm: 'sm:max-w-sm',
  md: 'sm:max-w-md',
  lg: 'sm:max-w-lg',
  xl: 'sm:max-w-2xl',
}

interface BaseModalProps {
  onClose: () => void
  size?: ModalSize
  fullScreenMobile?: boolean
  children: React.ReactNode
}

export default function BaseModal({ onClose, size = 'md', fullScreenMobile, children }: BaseModalProps) {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose])

  const backdropClass = fullScreenMobile
    ? 'fixed inset-0 z-[60] flex items-stretch sm:items-center sm:p-4 justify-center bg-zinc-950/60 backdrop-blur-[2px]'
    : 'fixed inset-0 z-[60] flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-[2px]'

  const containerClass = fullScreenMobile
    ? `relative w-full h-full sm:h-auto ${smSizeClasses[size]} rounded-none sm:rounded-2xl flex flex-col
        bg-gradient-to-br from-zinc-900/95 to-black/90
        backdrop-blur-xl
        border-0 sm:border border-white/[0.08]
        shadow-2xl shadow-black/50
        sm:animate-[scaleIn_0.2s_ease-out_forwards]`
    : `relative w-full ${sizeClasses[size]} rounded-2xl
        bg-gradient-to-br from-zinc-900/95 to-black/90
        backdrop-blur-xl
        border border-white/[0.08]
        shadow-2xl shadow-black/50
        animate-[scaleIn_0.2s_ease-out_forwards]`

  return (
    <div className={backdropClass} onClick={onClose}>
      <div className={containerClass} onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  )
}
