'use client'

import { X } from 'lucide-react'
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
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-zinc-950/40 backdrop-blur-[2px]"
      onClick={onClose}
    >
      <div
        className={`relative w-full ${sizeClasses[size]} rounded-2xl
          bg-gradient-to-br from-white/80 to-zinc-50/70
          backdrop-blur-xl
          border border-white/60
          shadow-2xl shadow-zinc-950/20
          animate-[scaleIn_0.2s_ease-out_forwards]`}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  )
}

interface ModalHeaderProps {
  title: string
  icon?: React.ReactNode
  onClose: () => void
}

export function ModalHeader({ title, icon, onClose }: ModalHeaderProps) {
  return (
    <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-white/40">
      <div className="flex items-center gap-3">
        {icon && (
          <div className="w-8 h-8 rounded-xl bg-white/50 border border-white/60 flex items-center justify-center shadow-sm">
            {icon}
          </div>
        )}
        <h3 className="text-base font-semibold text-zinc-900">{title}</h3>
      </div>
      <button
        onClick={onClose}
        className="text-zinc-400 hover:text-zinc-700 transition-colors p-1 rounded-lg hover:bg-white/50"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}

export function ModalBody({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`px-6 py-5 ${className ?? ''}`}>
      {children}
    </div>
  )
}

export function ModalFooter({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-end gap-3 px-6 pb-6 pt-2 border-t border-white/40">
      {children}
    </div>
  )
}

export function ModalCancelButton({ onClick, label = 'Anuluj' }: { onClick: () => void; label?: string }) {
  return (
    <button
      onClick={onClick}
      className="px-4 py-2 text-sm text-zinc-600 hover:text-zinc-900 font-medium transition-colors"
    >
      {label}
    </button>
  )
}
