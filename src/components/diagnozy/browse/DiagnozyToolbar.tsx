'use client'

import BrowseSearchInput from '@/components/ui/BrowseSearchInput'
import DropdownSelect from '@/components/ui/DropdownSelect'
import { getDiagnozyChapterSelectOptions } from '@/helpers/getDiagnozyChapterSelectOptions'
import { getDiagnozyStatusSelectOptions } from '@/helpers/getDiagnozyStatusSelectOptions'
import { getDiagnozySortSelectOptions } from '@/helpers/getDiagnozySortSelectOptions'
import type {
  DiagnozyBrowseCriteria,
  DiagnozyChapterOption,
  DiagnozySortKey,
  DiagnozyStatusFilter,
} from '@/types/diagnozyTypes'

export default function DiagnozyToolbar({
  criteria,
  chapters,
  onChange,
}: {
  criteria: DiagnozyBrowseCriteria
  chapters: DiagnozyChapterOption[]
  onChange: (patch: Partial<DiagnozyBrowseCriteria>) => void
}) {
  return (
    <div className="sticky top-0 z-20 -mx-1 px-1 py-3 bg-zinc-50/90 backdrop-blur-sm flex flex-col sm:flex-row sm:items-center gap-2 flex-wrap">
      <BrowseSearchInput
        value={criteria.search}
        onChange={(search) => onChange({ search })}
        placeholder="Szukaj diagnozy, sekcji, autora…"
        ariaLabel="Szukaj diagnoz"
        className="flex-1 min-w-[12rem]"
      />

      <DropdownSelect
        value={criteria.chapter}
        onSelect={(chapter) => onChange({ chapter })}
        options={getDiagnozyChapterSelectOptions(chapters)}
        ariaLabel="Filtruj po rozdziale"
        className="w-full sm:w-56"
      />

      <DropdownSelect
        value={criteria.status}
        onSelect={(status) => onChange({ status: status as DiagnozyStatusFilter })}
        options={getDiagnozyStatusSelectOptions()}
        ariaLabel="Filtruj po statusie"
        className="w-full sm:w-44"
      />

      <DropdownSelect
        value={criteria.sort}
        onSelect={(sort) => onChange({ sort: sort as DiagnozySortKey })}
        options={getDiagnozySortSelectOptions()}
        ariaLabel="Sortuj"
        className="w-full sm:w-52"
      />
    </div>
  )
}
