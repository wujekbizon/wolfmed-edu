'use client'

import { X } from 'lucide-react'

interface ModalHeaderProps {
  title: string
  icon?: React.ReactNode
  onClose: () => void
}

export default function ModalHeader({ title, icon, onClose }: ModalHeaderProps) {
  return (
    <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-white/[0.08]">
      <div className="flex items-center gap-3">
        {icon && (
          <div className="w-8 h-8 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center shadow-sm">
            {icon}
          </div>
        )}
        <h3 className="text-base font-semibold text-zinc-100">{title}</h3>
      </div>
      <button
        onClick={onClose}
        className="text-zinc-500 hover:text-zinc-200 transition-colors p-1 rounded-lg hover:bg-white/10"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}
