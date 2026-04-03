import Link from 'next/link'
import { Lock } from 'lucide-react'
import ResizableComponent from '../Resizable'
import RagCellForm from './RagCellForm'

export default function RagCell({ cell, isPremium = false }: { cell: { id: string; content: string }; isPremium?: boolean }) {
  if (!isPremium) {
    return (
      <ResizableComponent direction="vertical">
        <div className="flex flex-col items-center justify-center gap-3 h-full bg-white p-3 pb-6 rounded shadow-xl border border-zinc-200/60 text-zinc-500">
          <Lock className="w-6 h-6 text-zinc-400" />
          <p className="text-sm font-medium">Funkcja dostępna tylko dla użytkowników premium</p>
          <Link
            href="/panel/kursy"
            className="px-4 py-1.5 bg-gradient-to-r from-slate-600 to-rose-600 text-white text-xs rounded-full hover:from-slate-700 hover:to-rose-700 transition-all"
          >
            Odblokuj dostęp
          </Link>
        </div>
      </ResizableComponent>
    )
  }

  return (
    <ResizableComponent direction="vertical">
      <div className="flex flex-col h-full bg-white p-3 pb-6 rounded shadow-xl border border-zinc-200/60">
        <RagCellForm cell={cell} />
      </div>
    </ResizableComponent>
  )
}
