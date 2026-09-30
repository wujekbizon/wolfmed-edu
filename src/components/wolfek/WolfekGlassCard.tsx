'use client'

import { Minus } from 'lucide-react'
import { Tooltip } from '@/components/Tooltip'
import type { WolfekGlassCardProps } from '@/types/wolfekTypes'

export default function WolfekGlassCard({ avatarRef, avatar, children, className, glassClassName,
  surfaceClassName, onMinimize, onPointerMove, onPointerLeave, onPointerCancel }: WolfekGlassCardProps) {
  return <div className={`wolfek-card-wrap ${className ?? ''}`} onPointerMove={onPointerMove}
    onPointerLeave={onPointerLeave} onPointerCancel={onPointerCancel}>
    <div className={`wolfek-glass ${glassClassName ?? ''}`}>
      <div className={`wolfek-glass-surface ${surfaceClassName ?? ''}`} aria-hidden="true" />
      {onMinimize && <Tooltip message="Zminimalizuj Wolfka" position="bottom-left"
        className="wolfek-minimize-tooltip">
        <button type="button" className="wolfek-minimize" data-wolfek-focus-target onClick={onMinimize}
          aria-label="Zminimalizuj Wolfka"><Minus size={16} /></button>
      </Tooltip>}
      {children}
      <div ref={avatarRef} className="wolfek-card-avatar">{avatar}</div>
    </div>
  </div>
}
