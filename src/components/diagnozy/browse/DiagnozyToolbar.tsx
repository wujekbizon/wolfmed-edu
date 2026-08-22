'use client'

import { Search, X } from 'lucide-react'
import Input from '@/components/ui/Input'
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
      <div className="relative flex-1 min-w-[12rem]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
        <Input
          type="text"
          value={criteria.search}
          onChangeHandler={(e) => onChange({ search: e.target.value })}
          placeholder="Szukaj diagnozy, sekcji, autora…"
          ariaLabel="Szukaj diagnoz"
          className="w-full h-10 rounded-xl border border-zinc-300 bg-white pl-9 pr-9 text-sm text-zinc-700
            focus:border-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-100"
        />
        {criteria.search && (
          <button
            type="button"
            onClick={() => onChange({ search: '' })}
            aria-label="Wyczyść"
            className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-full text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

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
