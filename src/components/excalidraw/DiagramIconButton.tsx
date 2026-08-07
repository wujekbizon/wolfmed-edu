import type { LucideIcon } from 'lucide-react'
import { DIAGRAM_SURFACE, type DiagramTheme } from '@/constants/diagramChrome'

interface DiagramIconButtonProps {
  icon: LucideIcon
  label: string
  theme: DiagramTheme
  onClick: () => void
  /** The side rail's buttons are 36px; the top row's chips are 40px. */
  compact?: boolean
  className?: string
}

/**
 * Sized and coloured to match Excalidraw's own controls, so the canvas reads as
 * one toolbar rather than an app widget dropped on top of it.
 *
 * Excalidraw's controls are not one size: the top-row Library chip is 40px
 * tall, the side rail's buttons are 36. Both are matched with a fixed square —
 * the chip derives its height from padding plus the line height of its label,
 * so it measures differently under different font metrics.
 */
export default function DiagramIconButton({
  icon: Icon,
  label,
  theme,
  onClick,
  compact = false,
  className = '',
}: DiagramIconButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      className={`flex ${compact ? 'h-9 w-9' : 'h-10 w-10'} shrink-0 cursor-pointer items-center justify-center rounded-lg transition-colors ${DIAGRAM_SURFACE[theme].button} ${className}`}
    >
      <Icon size={16} strokeWidth={1.75} aria-hidden />
    </button>
  )
}
