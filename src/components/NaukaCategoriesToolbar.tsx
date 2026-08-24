'use client'

import BrowseSearchInput from '@/components/ui/BrowseSearchInput'
import DropdownSelect from '@/components/ui/DropdownSelect'
import { NAUKA_CATEGORY_SORT_OPTIONS } from '@/constants/naukaCategoriesBrowse'
import type {
  NaukaCategoryBrowseCriteria,
  NaukaCategorySortKey,
} from '@/types/categoryType'
import type { SelectOption } from '@/types/uiTypes'

export default function NaukaCategoriesToolbar({
  criteria,
  courseOptions,
  onChange,
}: {
  criteria: NaukaCategoryBrowseCriteria
  courseOptions: SelectOption[]
  onChange: (patch: Partial<NaukaCategoryBrowseCriteria>) => void
}) {
  return (
    <div className='sticky top-0 z-20 -mx-1 px-1 py-3 bg-white/90 backdrop-blur-sm flex flex-col sm:flex-row sm:items-center gap-2'>
      <BrowseSearchInput
        value={criteria.search}
        onChange={(search) => onChange({ search })}
        placeholder='Szukaj kategorii…'
        ariaLabel='Szukaj kategorii nauki'
        className='flex-1 min-w-48'
      />

      <DropdownSelect
        value={criteria.course}
        onSelect={(course) => onChange({ course })}
        options={courseOptions}
        ariaLabel='Filtruj kategorie według kursu'
        className='w-full sm:w-52'
      />

      <DropdownSelect
        value={criteria.sort}
        onSelect={(sort) => onChange({ sort: sort as NaukaCategorySortKey })}
        options={NAUKA_CATEGORY_SORT_OPTIONS}
        ariaLabel='Sortuj kategorie'
        className='w-full sm:w-52'
      />
    </div>
  )
}
