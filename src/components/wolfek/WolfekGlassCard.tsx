'use client'

import { Minus } from 'lucide-react'
import type { WolfekGlassCardProps } from '@/types/wolfekTypes'

export default function WolfekGlassCard({ avatarRef, avatar, children, className, glassClassName,
  surfaceClassName, onMinimize, onPointerMove, onPointerLeave, onPointerCancel }: WolfekGlassCardProps) {
  return <div className={`wolfek-card-wrap ${className ?? ''}`} onPointerMove={onPointerMove}
    onPointerLeave={onPointerLeave} onPointerCancel={onPointerCancel}>
    <div className={`wolfek-glass ${glassClassName ?? ''}`}>
      <div className={`wolfek-glass-surface ${surfaceClassName ?? ''}`} aria-hidden="true" />
      {onMinimize && <button type="button" className="wolfek-minimize" data-wolfek-focus-target onClick={onMinimize}
        title="Zminimalizuj Wolfka" aria-label="Zminimalizuj Wolfka"><Minus size={16} /></button>}
      {children}
      <div ref={avatarRef} className="wolfek-card-avatar">{avatar}</div>
    </div>
  </div>
}
