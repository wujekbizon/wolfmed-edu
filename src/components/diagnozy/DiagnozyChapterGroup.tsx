import DiagnozaCard from '@/components/diagnozy/DiagnozaCard'
import type { DiagnozyChapter } from '@/types/diagnozyTypes'

export default function DiagnozyChapterGroup({
  chapter,
  completedSlugs,
}: {
  chapter: DiagnozyChapter
  completedSlugs: string[]
}) {
  return (
    <section aria-labelledby={`rozdzial-${chapter.number}`}>
      <div className="flex items-center gap-3 mb-4">
        <h2
          id={`rozdzial-${chapter.number}`}
          className="text-lg font-bold text-zinc-800 shrink-0"
        >
          {chapter.number}. {chapter.title}
        </h2>
        <div className="h-px bg-zinc-200 flex-1" />
        <span className="text-xs text-zinc-400 shrink-0">
          {chapter.diagnozy.length}{' '}
          {chapter.diagnozy.length === 1 ? 'diagnoza' : 'diagnozy'}
        </span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {chapter.diagnozy.map((diagnoza) => (
          <DiagnozaCard
            key={diagnoza.id}
            diagnoza={diagnoza}
            completed={completedSlugs.includes(diagnoza.slug)}
          />
        ))}
      </div>
    </section>
  )
}
