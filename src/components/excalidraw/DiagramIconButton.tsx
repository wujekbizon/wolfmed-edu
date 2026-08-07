import type { LucideIcon } from 'lucide-react'
import { DIAGRAM_SURFACE, type DiagramTheme } from '@/constants/diagramChrome'

interface DiagramIconButtonProps {
  icon: LucideIcon
  label: string
  theme: DiagramTheme
  onClick: () => void
  className?: string
}

/**
 * Sized and coloured to match Excalidraw's own controls, so the canvas reads as
 * one toolbar rather than an app widget dropped on top of it.
 */
export default function DiagramIconButton({
  icon: Icon,
  label,
  theme,
  onClick,
  className = '',
}: DiagramIconButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      className={`flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-lg transition-colors ${DIAGRAM_SURFACE[theme].button} ${className}`}
    >
      <Icon size={16} strokeWidth={1.75} aria-hidden />
    </button>
  )
}
