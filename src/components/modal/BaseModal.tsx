'use client'

import { useEffect } from 'react'

type ModalSize = 'sm' | 'md' | 'lg' | 'xl'

const sizeClasses: Record<ModalSize, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-2xl',
}

interface BaseModalProps {
  onClose: () => void
  size?: ModalSize
  children: React.ReactNode
}

export default function BaseModal({ onClose, size = 'md', children }: BaseModalProps) {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-[2px]"
      onClick={onClose}
    >
      <div
        className={`relative w-full ${sizeClasses[size]} rounded-2xl
          bg-gradient-to-br from-zinc-900/95 to-black/90
          backdrop-blur-xl
          border border-white/[0.08]
          shadow-2xl shadow-black/50
          animate-[scaleIn_0.2s_ease-out_forwards]`}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  )
}
