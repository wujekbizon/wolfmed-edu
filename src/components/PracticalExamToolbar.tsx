'use client'

import BrowseSearchInput from '@/components/ui/BrowseSearchInput'
import DropdownSelect from '@/components/ui/DropdownSelect'
import { PRACTICAL_EXAM_SORT_OPTIONS } from '@/constants/practicalExamBrowse'
import type { PracticalExamToolbarProps } from '@/types/practicalExamBrowseTypes'

export default function PracticalExamToolbar({ criteria, years, onChange }: PracticalExamToolbarProps) {
  return (
    <div className='flex flex-col gap-2 rounded-2xl border border-zinc-200/60 bg-white p-3 sm:p-4 xl:flex-row xl:items-center'>
      <BrowseSearchInput value={criteria.search} onChange={(search) => onChange({ search })} placeholder='Szukaj arkusza…' ariaLabel='Szukaj arkusza według nazwy, sesji lub kodu' className='min-w-0 flex-1' />
      <div className='flex flex-col gap-2 sm:flex-row'>
        <DropdownSelect value={criteria.year} onSelect={(year) => onChange({ year })} options={[{ value: 'all', label: 'Wszystkie lata' }, ...years.map((year) => ({ value: String(year), label: String(year) }))]} ariaLabel='Filtruj arkusze według roku' className='w-full sm:w-52' />
        <DropdownSelect value={criteria.sort} onSelect={(sort) => onChange({ sort })} options={PRACTICAL_EXAM_SORT_OPTIONS} ariaLabel='Sortuj arkusze' className='w-full sm:w-52' />
      </div>
    </div>
  )
}
