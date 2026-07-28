import type { LucideIcon } from 'lucide-react'

interface TopicActionButtonProps {
  icon: LucideIcon
  label: string
  fullLabel: string
  gradientClassName: string
  onClick: () => void
}

export default function TopicActionButton({
  icon: Icon,
  label,
  fullLabel,
  gradientClassName,
  onClick,
}: TopicActionButtonProps) {
  return (
    <button
      type='button'
      onClick={onClick}
      aria-label={fullLabel}
      title={fullLabel}
      className={`inline-flex flex-1 items-center justify-center gap-1.5 rounded-full px-3 py-2 pointer-coarse:min-h-11 text-xs font-medium text-white shadow-sm transition-shadow hover:shadow-md ${gradientClassName}`}
    >
      <Icon className='w-3.5 h-3.5 shrink-0' />
      <span className='truncate'>{label}</span>
    </button>
  )
}
