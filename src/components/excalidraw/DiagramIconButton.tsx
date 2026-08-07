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
 *
 * 40px is the Library chip's height in the app. That chip sizes itself from its
 * padding plus the line height of its label, so it measures differently under
 * different font metrics — a fixed square matches it without inheriting that
 * dependency.
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
      className={`flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-lg transition-colors ${DIAGRAM_SURFACE[theme].button} ${className}`}
    >
      <Icon size={16} strokeWidth={1.75} aria-hidden />
    </button>
  )
}
