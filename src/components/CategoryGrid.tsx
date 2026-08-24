import LearningCategoryCard from '@/components/LearningCategoryCard'
import type { NaukaCategoryBrowseItem } from '@/types/categoryType'

export default function CategoryGrid({
  categories,
}: {
  categories: NaukaCategoryBrowseItem[]
}) {
  return (
    <div className='h-fit grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-6'>
      {categories.map((item) => (
        <LearningCategoryCard key={item.value} item={item} />
      ))}
    </div>
  )
}
