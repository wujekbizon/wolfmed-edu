import type { LucideIcon } from 'lucide-react'

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
    <button
      type='button'
      onClick={onClick}
      aria-label={fullLabel}
      title={fullLabel}
      className={`inline-flex shrink-0 items-center justify-center gap-1.5 rounded-xl h-11 w-11 @3xs:h-auto @3xs:w-auto @3xs:px-3 @3xs:py-2 @3xs:min-h-9 pointer-coarse:@3xs:min-h-11 text-xs font-medium transition-all ${colorClassName}`}
    >
      <Icon className='w-4 h-4 @3xs:w-3.5 @3xs:h-3.5 shrink-0' />
      <span className='hidden @3xs:inline'>{label}</span>
    </button>
  )
}
