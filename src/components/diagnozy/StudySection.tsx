import { ChevronDown } from 'lucide-react'

export default function StudySection({
  title,
  defaultOpen = true,
  children,
}: {
  title: string
  defaultOpen?: boolean
  children: React.ReactNode
}) {
  return (
    <details
      open={defaultOpen}
      className="group bg-white border border-zinc-200 rounded-2xl overflow-hidden"
    >
      <summary
        className="flex items-center justify-between gap-2 px-4 py-3 cursor-pointer select-none
          text-sm font-bold text-zinc-800 uppercase tracking-wide hover:bg-zinc-50 transition-colors"
      >
        {title}
        <ChevronDown className="w-4 h-4 text-zinc-400 transition-transform group-open:rotate-180" />
      </summary>
      <div className="px-4 pb-4 pt-1">{children}</div>
    </details>
  )
}
