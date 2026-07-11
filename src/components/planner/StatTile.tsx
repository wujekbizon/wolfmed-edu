import type { LucideIcon } from 'lucide-react'

export default function StatTile({
  icon: Icon,
  value,
  label,
}: {
  icon: LucideIcon
  value: string
  label: string
}) {
  return (
    <div className="flex-1 flex flex-col gap-2 px-4 py-3.5 border-l border-zinc-200 first:border-l-0">
      <div className="flex items-center gap-2.5">
        <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-[#ff9898] to-fuchsia-400 text-white shadow-sm shrink-0">
          <Icon className="w-4 h-4" />
        </span>
        <span className="text-2xl font-bold text-zinc-800 tabular-nums leading-none">{value}</span>
      </div>
      <span className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">{label}</span>
    </div>
  )
}
