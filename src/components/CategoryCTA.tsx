import { BookOpen, ListChecks, Sparkles, Target } from 'lucide-react'
import type { CategoryDetails } from '@/types/categoryType'
import { countCategoryContent } from '@/helpers/countCategoryContent'
import { pluralizePl } from '@/helpers/pluralizePl'
import CategoryBenefit from './CategoryBenefit'

interface CategoryCTAProps {
  categoryName: string
  testCount: number
  details?: CategoryDetails
  isPremium?: boolean
}

export default function CategoryCTA({
  categoryName,
  testCount,
  details,
  isPremium = false,
}: CategoryCTAProps) {
  const { topics, outcomes } = countCategoryContent(details)

  return (
    <div className='bg-white rounded-lg shadow-md p-4 sm:p-6 md:p-8'>
      <h2 className='text-2xl font-bold mb-2'>Co znajdziesz w tej kategorii?</h2>
      <p className='text-gray-600 mb-6 text-sm sm:text-base'>
        {categoryName} to gotowy materiał do nauki i sprawdzenia się przed egzaminem —
        ucz się w swoim tempie, a potem od razu przetestuj wiedzę.
      </p>

      <div className='grid grid-cols-1 xs:grid-cols-2 gap-3'>
        <CategoryBenefit
          icon={ListChecks}
          value={`${testCount}`}
          label={pluralizePl(testCount, ['pytanie testowe', 'pytania testowe', 'pytań testowych'])}
        />
        {topics > 0 && (
          <CategoryBenefit
            icon={BookOpen}
            value={`${topics}`}
            label={pluralizePl(topics, [
              'zagadnienie w programie',
              'zagadnienia w programie',
              'zagadnień w programie',
            ])}
          />
        )}
        {outcomes > 0 && (
          <CategoryBenefit
            icon={Target}
            value={`${outcomes}`}
            label={pluralizePl(outcomes, [
              'efekt kształcenia',
              'efekty kształcenia',
              'efektów kształcenia',
            ])}
          />
        )}
        {isPremium && (
          <CategoryBenefit
            icon={Sparkles}
            value='AI'
            label='asystent wyjaśni zagadnienie i ułoży plan nauki'
          />
        )}
      </div>
    </div>
  )
}
