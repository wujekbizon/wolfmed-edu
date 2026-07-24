'use client'

import { useMemo, useState } from 'react'
import { SearchX } from 'lucide-react'
import DiagnozyToolbar from '@/components/diagnozy/browse/DiagnozyToolbar'
import DiagnozyChapterGroup from '@/components/diagnozy/DiagnozyChapterGroup'
import DiagnozaCard from '@/components/diagnozy/DiagnozaCard'
import { filterAndSortDiagnozy } from '@/helpers/filterAndSortDiagnozy'
import { groupDiagnozyByChapter } from '@/helpers/groupDiagnozyByChapter'
import { compareDiagnozySection } from '@/helpers/compareDiagnozySection'
import type {
  DiagnozaListItem,
  DiagnozyBrowseCriteria,
} from '@/types/diagnozyTypes'

const DEFAULT_CRITERIA: DiagnozyBrowseCriteria = {
  search: '',
  chapter: '',
  status: 'all',
  sort: 'section-asc',
}

export default function DiagnozyBrowser({
  diagnozy,
  completedSlugs,
}: {
  diagnozy: DiagnozaListItem[]
  completedSlugs: string[]
}) {
  const [criteria, setCriteria] = useState<DiagnozyBrowseCriteria>(DEFAULT_CRITERIA)
  const onChange = (patch: Partial<DiagnozyBrowseCriteria>) =>
    setCriteria((prev) => ({ ...prev, ...patch }))

  const chapters = useMemo(() => {
    const map = new Map<string, string>()
    for (const d of diagnozy) if (!map.has(d.chapterNumber)) map.set(d.chapterNumber, d.chapterTitle)
    return [...map.entries()]
      .map(([number, title]) => ({ number, title }))
      .sort((a, b) => compareDiagnozySection(a.number, b.number))
  }, [diagnozy])

  const results = useMemo(
    () => filterAndSortDiagnozy(diagnozy, completedSlugs, criteria),
    [diagnozy, completedSlugs, criteria]
  )

  const grouped = criteria.sort === 'section-asc' || criteria.sort === 'section-desc'

  return (
    <div>
      <DiagnozyToolbar criteria={criteria} chapters={chapters} onChange={onChange} />

      <p className="text-xs text-zinc-400 mb-4" aria-live="polite">
        {results.length === diagnozy.length
          ? `${diagnozy.length} diagnoz`
          : `${results.length} z ${diagnozy.length} diagnoz`}
      </p>

      {results.length === 0 ? (
        <div className="bg-white rounded-2xl border border-zinc-200 p-8 text-center text-zinc-500 flex flex-col items-center gap-2">
          <SearchX className="w-6 h-6 text-zinc-300" />
          Brak wyników dla wybranych filtrów.
        </div>
      ) : grouped ? (
        <div className="flex flex-col gap-10">
          {groupDiagnozyByChapter(results).map((chapter) => (
            <DiagnozyChapterGroup
              key={chapter.number}
              chapter={chapter}
              completedSlugs={completedSlugs}
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {results.map((diagnoza) => (
            <DiagnozaCard
              key={diagnoza.id}
              diagnoza={diagnoza}
              completed={completedSlugs.includes(diagnoza.slug)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
