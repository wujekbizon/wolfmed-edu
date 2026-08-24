import { SearchX } from 'lucide-react'
import CategoryGrid from '@/components/CategoryGrid'
import type { NaukaCategoryBrowseItem } from '@/types/categoryType'

export default function NaukaCategoriesResults({
  categories,
}: {
  categories: NaukaCategoryBrowseItem[]
}) {
  if (categories.length === 0) {
    return (
      <div className='rounded-2xl border border-zinc-200 p-8 text-center text-zinc-500 flex flex-col items-center gap-2'>
        <SearchX className='w-6 h-6 text-zinc-300' />
        Brak kategorii dla wybranych filtrów.
      </div>
    )
  }

  return <CategoryGrid categories={categories} />
}
