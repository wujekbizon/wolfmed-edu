import type { LucideIcon } from 'lucide-react'
import { Tooltip } from './Tooltip'

interface TopicActionButtonProps {
  icon: LucideIcon
  label: string
  fullLabel: string
  colorClassName: string
  onClick: () => void
}

export default function TopicActionButton({
  icon: Icon,
  label,
  fullLabel,
  colorClassName,
  onClick,
}: TopicActionButtonProps) {
  return (
    // top-left anchors the tooltip's right edge to the button's; these buttons sit
    // at the card's trailing edge, so a centred tooltip runs off screen at 320px.
    <Tooltip message={fullLabel} position='top-left'>
      <button
        type='button'
        onClick={onClick}
        aria-label={fullLabel}
        className={`inline-flex shrink-0 items-center justify-center gap-1.5 rounded-xl h-10 w-10 @3xs:h-auto @3xs:w-auto @3xs:px-3 @3xs:py-2 @3xs:min-h-10 text-xs font-medium transition-all ${colorClassName}`}
      >
        <Icon className='w-4 h-4 @3xs:w-3.5 @3xs:h-3.5 shrink-0' />
        <span className='hidden @3xs:inline'>{label}</span>
      </button>
    </Tooltip>
  )
}
