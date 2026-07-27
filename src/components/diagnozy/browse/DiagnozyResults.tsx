import { SearchX } from 'lucide-react'
import DiagnozyChapterGroup from '@/components/diagnozy/DiagnozyChapterGroup'
import DiagnozaCard from '@/components/diagnozy/DiagnozaCard'
import { groupDiagnozyByChapter } from '@/helpers/groupDiagnozyByChapter'
import type { DiagnozaListItem } from '@/types/diagnozyTypes'

export default function DiagnozyResults({
  results,
  completedSlugs,
  grouped,
}: {
  results: DiagnozaListItem[]
  completedSlugs: string[]
  grouped: boolean
}) {
  if (results.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-zinc-200 p-8 text-center text-zinc-500 flex flex-col items-center gap-2">
        <SearchX className="w-6 h-6 text-zinc-300" />
        Brak wyników dla wybranych filtrów.
      </div>
    )
  }

  if (grouped) {
    return (
      <div className="flex flex-col gap-10">
        {groupDiagnozyByChapter(results).map((chapter) => (
          <DiagnozyChapterGroup
            key={chapter.number}
            chapter={chapter}
            completedSlugs={completedSlugs}
          />
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
      {results.map((diagnoza) => (
        <DiagnozaCard
          key={diagnoza.id}
          diagnoza={diagnoza}
          completed={completedSlugs.includes(diagnoza.slug)}
        />
      ))}
    </div>
  )
}
