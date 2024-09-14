import LearningCard from '@/components/LearningCard'
import SearchTerm from '@/components/SearchTerm'
import TestLoader from '@/components/TestsLoader'
import { loadingTestData } from '@/constants/loadingTestsData'

export default function Loading() {
  return (
    <section className="px-1 sm:px-4 py-4 w-full h-full ">
      <div className="overflow-y-auto scrollbar-webkit h-full flex flex-col items-center gap-8 pr-1">
        <div className="w-full md:w-3/4 lg:w-1/2 xl:w-1/3">
          <SearchTerm />
        </div>
        <div className="grid w-full grid-cols-1 gap-8 lg:w-3/4 xl:w-2/3">
          {loadingTestData.map((item, index) => (
            <LearningCard key={item.id} test={item} questionNumber={`${index + 1}/${loadingTestData.length}`} />
          ))}
        </div>
        <TestLoader />
      </div>
    </section>
  )
}
