import type { LucideIcon } from 'lucide-react'

interface ExamStatTileProps {
  icon: LucideIcon
  value: string
  label: string
  accent?: boolean
}

export default function ExamStatTile({ icon: Icon, value, label, accent }: ExamStatTileProps) {
  return (
    <div className="flex items-center gap-2.5 sm:gap-3 rounded-xl border border-zinc-200 bg-white p-2.5 sm:p-3">
      <span className="flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-zinc-100 text-zinc-500 shrink-0">
        <Icon className="w-4 h-4" />
      </span>
      <div className="flex flex-col leading-tight min-w-0">
        <span className={`text-sm font-bold ${accent ? 'text-[#ff5b5b]' : 'text-zinc-800'}`}>
          {value}
        </span>
        <span className="text-[11px] text-zinc-500 break-words">{label}</span>
      </div>
    </div>
  )
}
