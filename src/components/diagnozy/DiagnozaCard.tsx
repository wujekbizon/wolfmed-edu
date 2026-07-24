import Link from 'next/link'
import { ArrowRight, CheckCircle2, User } from 'lucide-react'
import type { DiagnozaListItem } from '@/types/diagnozyTypes'

const DIFFICULTY_LABELS: Record<string, string> = {
  basic: 'Podstawowy',
  intermediate: 'Średni',
  advanced: 'Zaawansowany',
}

export default function DiagnozaCard({
  diagnoza,
  completed,
}: {
  diagnoza: DiagnozaListItem
  completed: boolean
}) {
  return (
    <Link
      href={`/panel/diagnozy/${diagnoza.slug}`}
      className="group relative border border-zinc-400/60 bg-white flex flex-col p-4 rounded-2xl shadow-sm
        hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
    >
      <div className="flex items-center justify-between mb-3">
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-700">
          {diagnoza.section}
        </span>
        {completed && (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Ukończone
          </span>
        )}
      </div>

      <h3 className="text-base font-bold text-zinc-800 mb-2 line-clamp-2 leading-tight">
        {diagnoza.title}
      </h3>

      <p className="text-xs text-zinc-500 line-clamp-3 mb-4">{diagnoza.definicjaSnippet}…</p>

      <div className="mt-auto flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          {diagnoza.author && (
            <span className="inline-flex items-center gap-1 text-xs text-zinc-400 truncate">
              <User className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{diagnoza.author}</span>
            </span>
          )}
          {diagnoza.difficulty && (
            <span className="shrink-0 text-xs text-zinc-500 bg-zinc-100 px-2 py-0.5 rounded-full">
              {DIFFICULTY_LABELS[diagnoza.difficulty] ?? diagnoza.difficulty}
            </span>
          )}
        </div>
        <span
          className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-700 group-hover:text-zinc-900
            bg-zinc-100 group-hover:bg-zinc-200 px-3 py-1.5 rounded-full transition-all shrink-0"
        >
          Otwórz
          <ArrowRight className="w-3.5 h-3.5" />
        </span>
      </div>
    </Link>
  )
}
