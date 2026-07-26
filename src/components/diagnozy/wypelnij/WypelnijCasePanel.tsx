import { ChevronDown, FileText } from 'lucide-react'
import Card from '@/components/ui/Card'

// Collapsed by default: the case is read once and then referred back to, so it
// supports the task rather than competing with the patient for attention.
export default function WypelnijCasePanel({
  opisPrzypadku,
  defaultOpen = false,
}: {
  opisPrzypadku: string
  defaultOpen?: boolean
}) {
  return (
    <Card tone="plain" className="overflow-hidden">
      <details open={defaultOpen} className="group">
        <summary
          className="flex items-center justify-between gap-2 px-4 py-3 cursor-pointer
            select-none text-sm font-semibold text-zinc-700 hover:bg-zinc-50/70 transition-colors rounded-2xl"
        >
          <span className="inline-flex items-center gap-2">
            <FileText className="w-4 h-4 text-zinc-400" />
            Opis przypadku
          </span>
          <ChevronDown className="w-4 h-4 text-zinc-400 transition-transform group-open:rotate-180" />
        </summary>
        <p className="px-4 pb-4 pt-1 text-sm leading-relaxed text-zinc-600">{opisPrzypadku}</p>
      </details>
    </Card>
  )
}
