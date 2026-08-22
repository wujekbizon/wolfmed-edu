import type { LucideIcon } from 'lucide-react'

interface Props {
  icon: LucideIcon
  badge: string
  title: string
  subtitle?: string | undefined
}

export default function ExamSectionHeader({ icon: Icon, badge, title, subtitle }: Props) {
  return (
    <div className="flex items-start gap-3 px-5 md:px-6 py-4 border-b border-zinc-100 bg-zinc-50">
      <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 text-slate-600 shrink-0">
        <Icon className="w-5 h-5" />
      </span>
      <div className="flex flex-col gap-1 min-w-0">
        <span className="inline-flex w-fit items-center rounded-full bg-white border border-zinc-200 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
          {badge}
        </span>
        <h2 className="text-base md:text-lg font-bold text-zinc-900 leading-snug">{title}</h2>
        {subtitle && <p className="text-xs text-zinc-500">{subtitle}</p>}
      </div>
    </div>
  )
}
