import { ChevronDown, FileText } from 'lucide-react'

export default function WypelnijCasePanel({ opisPrzypadku }: { opisPrzypadku: string }) {
  return (
    <details
      open
      className="group bg-amber-50 border border-amber-200 rounded-2xl overflow-hidden"
    >
      <summary
        className="flex items-center justify-between gap-2 px-4 py-3 cursor-pointer select-none
          text-sm font-bold text-amber-900 hover:bg-amber-100/60 transition-colors"
      >
        <span className="inline-flex items-center gap-2">
          <FileText className="w-4 h-4" />
          Opis przypadku
        </span>
        <ChevronDown className="w-4 h-4 text-amber-700/60 transition-transform group-open:rotate-180" />
      </summary>
      <p className="px-4 pb-4 pt-1 text-sm text-zinc-700">{opisPrzypadku}</p>
    </details>
  )
}
