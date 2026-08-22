import type { LucideIcon } from 'lucide-react'

interface CategoryBenefitProps {
  icon: LucideIcon
  value: string
  label: string
}

export default function CategoryBenefit({ icon: Icon, value, label }: CategoryBenefitProps) {
  return (
    <div className='flex items-start gap-3 p-3 bg-zinc-50 rounded-lg border border-zinc-200'>
      <span className='flex items-center justify-center w-9 h-9 shrink-0 rounded-xl bg-white border border-zinc-200 text-zinc-500'>
        <Icon className='w-4 h-4' />
      </span>
      <span className='min-w-0'>
        <span className='block text-lg font-bold leading-none text-zinc-800 tabular-nums'>
          {value}
        </span>
        <span className='block mt-1 text-xs text-zinc-500 break-words'>{label}</span>
      </span>
    </div>
  )
}
