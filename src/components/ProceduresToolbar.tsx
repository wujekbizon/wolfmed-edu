'use client'

import BrowseSearchInput from '@/components/ui/BrowseSearchInput'
import DropdownSelect from '@/components/ui/DropdownSelect'
import { PROCEDURE_BROWSE_SORT_OPTIONS } from '@/constants/procedureBrowse'
import type {
  ProcedureBrowseCriteria,
  ProcedureBrowseSortKey,
} from '@/types/procedureBrowseTypes'

export default function ProceduresToolbar({
  criteria,
  onChange,
}: {
  criteria: ProcedureBrowseCriteria
  onChange: (patch: Partial<ProcedureBrowseCriteria>) => void
}) {
  return (
    <div className='sticky top-0 z-20 py-3 bg-zinc-50/90 backdrop-blur-sm flex flex-col sm:flex-row gap-2'>
      <BrowseSearchInput
        value={criteria.search}
        onChange={(search) => onChange({ search })}
        placeholder='Szukaj procedury, czynności, sprzętu…'
        ariaLabel='Szukaj procedur'
        className='flex-1 min-w-48'
      />
      <DropdownSelect
        value={criteria.sort}
        onSelect={(sort) => onChange({ sort: sort as ProcedureBrowseSortKey })}
        options={PROCEDURE_BROWSE_SORT_OPTIONS}
        ariaLabel='Sortuj procedury'
        className='w-full sm:w-52'
      />
    </div>
  )
}
