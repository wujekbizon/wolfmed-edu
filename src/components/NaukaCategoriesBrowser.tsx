'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { NAUKA_CATEGORY_DEFAULT_CRITERIA } from '@/constants/naukaCategoriesBrowse'
import { filterAndSortNaukaCategories } from '@/helpers/filterAndSortNaukaCategories'
import { getNaukaCourseSelectOptions } from '@/helpers/getNaukaCourseSelectOptions'
import { pluralizePl } from '@/helpers/pluralizePl'
import { useDebouncedValue } from '@/hooks/useDebounceValue'
import NaukaCategoriesToolbar from '@/components/NaukaCategoriesToolbar'
import NaukaCategoriesResults from '@/components/NaukaCategoriesResults'
import type {
  NaukaCategoryBrowseCriteria,
  NaukaCategoryBrowseItem,
} from '@/types/categoryType'

const STALE_TIME = 10 * 60 * 1000

export default function NaukaCategoriesBrowser({
  categories,
}: {
  categories: NaukaCategoryBrowseItem[]
}) {
  const [criteria, setCriteria] = useState(NAUKA_CATEGORY_DEFAULT_CRITERIA)
  const debouncedSearch = useDebouncedValue(criteria.search, 250)
  const effectiveCriteria = { ...criteria, search: debouncedSearch }
  const onChange = (patch: Partial<NaukaCategoryBrowseCriteria>) =>
    setCriteria((current) => ({ ...current, ...patch }))

  const { data: courseOptions } = useQuery({
    queryKey: ['naukaCategoryCourses', categories],
    queryFn: async () => getNaukaCourseSelectOptions(categories),
    initialData: () => getNaukaCourseSelectOptions(categories),
    staleTime: STALE_TIME,
  })

  const { data: results } = useQuery({
    queryKey: [
      'naukaCategories',
      categories,
      debouncedSearch,
      criteria.course,
      criteria.sort,
    ],
    queryFn: async () => filterAndSortNaukaCategories(categories, effectiveCriteria),
    initialData: () => filterAndSortNaukaCategories(categories, effectiveCriteria),
    staleTime: STALE_TIME,
  })

  return (
    <>
      <NaukaCategoriesToolbar
        criteria={criteria}
        courseOptions={courseOptions}
        onChange={onChange}
      />
      <p className='text-xs text-zinc-400 mb-4' aria-live='polite'>
        {results.length === categories.length
          ? `${categories.length} ${pluralizePl(categories.length, ['kategoria', 'kategorie', 'kategorii'])}`
          : `${results.length} z ${categories.length} kategorii`}
      </p>
      <NaukaCategoriesResults categories={results} />
    </>
  )
}
