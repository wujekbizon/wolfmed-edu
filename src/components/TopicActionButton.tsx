import type { LucideIcon } from 'lucide-react'

interface TopicActionButtonProps {
  icon: LucideIcon
  label: string
  gradientClassName: string
  onClick: () => void
}

export default function TopicActionButton({
  icon: Icon,
  label,
  gradientClassName,
  onClick,
}: TopicActionButtonProps) {
  return (
    <button
      type='button'
      onClick={onClick}
      aria-label={label}
      title={label}
      className={`inline-flex shrink-0 items-center justify-center min-w-9 min-h-9 lg:min-w-0 lg:min-h-0 rounded-full p-1.5 text-white shadow-md transition-all hover:shadow-lg ${gradientClassName}`}
    >
      <Icon className='w-4 h-4 lg:w-3.5 lg:h-3.5 shrink-0' />
      <span className='hidden lg:block max-w-0 overflow-hidden whitespace-nowrap text-xs font-medium opacity-0 transition-all duration-300 group-hover:ml-1.5 group-hover:max-w-40 group-hover:opacity-100'>
        {label}
      </span>
    </button>
  )
}
