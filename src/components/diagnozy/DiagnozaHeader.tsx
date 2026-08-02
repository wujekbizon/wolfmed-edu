import type { Diagnoza } from '@/types/diagnozyTypes'

export default function DiagnozaHeader({ diagnoza }: { diagnoza: Diagnoza }) {
  return (
    <header className="mb-6">
      <div className="flex items-center gap-2 mb-2">
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-700">
          {diagnoza.section}
        </span>
        <span className="text-xs text-zinc-400">
          {diagnoza.chapter.number}
          {diagnoza.chapter.title ? `. ${diagnoza.chapter.title}` : ''}
        </span>
      </div>
      <h1 className="text-2xl font-bold text-zinc-800">{diagnoza.title}</h1>
    </header>
  )
}
