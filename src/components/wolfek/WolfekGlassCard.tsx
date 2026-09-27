'use client'

import { Minus } from 'lucide-react'
import type { WolfekGlassCardProps } from '@/types/wolfekTypes'

export default function WolfekGlassCard({ avatarRef, avatar, children, onMinimize, onPointerMove, onPointerLeave, onPointerCancel }: WolfekGlassCardProps) {
  return <div className="wolfek-card-wrap" onPointerMove={onPointerMove}
    onPointerLeave={onPointerLeave} onPointerCancel={onPointerCancel}>
    <div className="wolfek-glass">
      <div className="wolfek-glass-surface" aria-hidden="true" />
      <button type="button" className="wolfek-minimize" onClick={onMinimize}
        title="Zminimalizuj Wolfka" aria-label="Zminimalizuj Wolfka"><Minus size={16} /></button>
      {children}
      <div ref={avatarRef} className="wolfek-card-avatar">{avatar}</div>
    </div>
  </div>
}
