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
      className={`inline-flex shrink-0 items-center justify-center gap-1.5 rounded-xl h-11 w-11 sm:h-auto sm:w-auto sm:px-3 sm:py-2 sm:min-h-9 pointer-coarse:sm:min-h-11 text-xs font-medium transition-all ${colorClassName}`}
    >
      <Icon className='w-4 h-4 sm:w-3.5 sm:h-3.5 shrink-0' />
      <span className='hidden sm:inline'>{label}</span>
    </button>
  )
}
