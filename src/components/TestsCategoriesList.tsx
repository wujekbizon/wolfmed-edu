import { PopulatedCategories } from '@/types/categoryType'
import TestsCategoryCard from './TestsCategoryCard'
import PremiumLock from './PremiumLock'
import TestsCategoryCardSkeleton from './skeletons/TestsCategoryCardSkeleton'

export default function TestsCategoriesList({
  categories,
  isSupporter
}: {
  categories: PopulatedCategories[]
  isSupporter: boolean
}) {
  return (
    <>
      {!isSupporter ? (
        <div className='relative'>
          <PremiumLock />
            <TestsCategoryCardSkeleton />
        </div>
      ) : (
        <div
          className={`h-full w-full 2xl:w-3/4 flex flex-col mx-auto gap-4 md:gap-8`}
        >
          {categories.map((item) => {
            return <TestsCategoryCard key={item.category} item={item} />
          })}
        </div>
      )}
    </>
  )
}
