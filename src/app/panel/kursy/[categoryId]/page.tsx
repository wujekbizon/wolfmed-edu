import { redirect } from 'next/navigation'
import { Metadata } from 'next'
import { getCurrentUser } from '@/server/user'
import { getTestsByCategory, countTestsByCategory } from '@/server/queries'
import { checkCourseAccessAction } from '@/actions/course-actions'
import { CATEGORY_METADATA, DEFAULT_CATEGORY_METADATA } from '@/constants/categoryMetadata'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

interface CategoryPageProps {
  params: Promise<{ categoryId: string }>
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { categoryId } = await params
  const decodedCategory = decodeURIComponent(categoryId)

  const metadata = CATEGORY_METADATA[decodedCategory]

  if (metadata?.title && metadata?.keywords) {
    return {
      title: metadata.title,
      description: metadata.description,
      keywords: metadata.keywords.join(', '),
    }
  }

  const categoryName = decodedCategory
    .replace(/-/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')

  return {
    title: `Testy - ${categoryName}`,
    description: metadata?.description || `Testy z kategorii ${categoryName}`,
  }
}

export default async function CategoryDetailPage({ params }: CategoryPageProps) {
  const { categoryId } = await params
  const decodedCategory = decodeURIComponent(categoryId)

  const user = await getCurrentUser()
  if (!user) redirect('/sign-in')

  // Get category metadata
  const categoryData = CATEGORY_METADATA[decodedCategory] || {
    ...DEFAULT_CATEGORY_METADATA,
    category: decodedCategory,
    course: '',
  }

  // Check if user has access to the parent course
  if (categoryData.course) {
    const courseAccess = await checkCourseAccessAction(categoryData.course)

    if (!courseAccess.hasAccess) {
      return (
        <section className='w-full h-full overflow-y-auto scrollbar-webkit p-4 lg:p-16'>
          <div className='max-w-4xl mx-auto'>
            <div className='bg-white rounded-lg shadow p-8'>
              <h2 className='text-2xl font-bold text-red-600 mb-4'>Brak dostępu</h2>
              <p className='text-gray-600 mb-6'>
                Nie masz dostępu do tego kursu. Kup kurs, aby uzyskać dostęp do testów z tej kategorii.
              </p>
              <Link
                href='/panel/kursy'
                className='inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors'
              >
                Wróć do moich kursów
              </Link>
            </div>
          </div>
        </section>
      )
    }
  }

  // Get tests for this category
  const [tests, testCount] = await Promise.all([
    getTestsByCategory(decodedCategory),
    countTestsByCategory(decodedCategory),
  ])

  const categoryName = decodedCategory
    .replace(/-/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')

  return (
    <section className='w-full h-full overflow-y-auto scrollbar-webkit p-4 lg:p-16'>
      <div className='max-w-6xl mx-auto'>
        {/* Breadcrumb */}
        <nav className='mb-6 text-sm'>
          <Link href='/panel/kursy' className='text-blue-600 hover:underline'>
            Moje Kursy
          </Link>
          <span className='mx-2 text-gray-400'>/</span>
          <span className='text-gray-600'>{categoryName}</span>
        </nav>

        {/* Category Header */}
        <div className='bg-white rounded-lg shadow-md overflow-hidden mb-6'>
          <div className='p-6 md:p-8'>
            <div className='flex items-start gap-6'>
              {categoryData.image && (
                <img
                  src={categoryData.image}
                  alt={categoryName}
                  className='w-24 h-24 md:w-32 md:h-32 rounded-lg object-cover'
                />
              )}
              <div className='flex-1'>
                <h1 className='text-3xl font-bold mb-2'>{categoryName}</h1>
                <p className='text-gray-600 mb-4'>{categoryData.description}</p>

                <div className='flex flex-wrap gap-4 text-sm'>
                  <div className='flex items-center gap-2'>
                    <span className='font-semibold'>Popularność:</span>
                    <span className='text-gray-600'>{categoryData.popularity}</span>
                  </div>
                  <div className='flex items-center gap-2'>
                    <span className='font-semibold'>Liczba pytań:</span>
                    <span className='text-gray-600'>{testCount}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tests Section */}
        {tests.length > 0 ? (
          <div className='bg-white rounded-lg shadow-md p-6'>
            <h2 className='text-2xl font-bold mb-4'>Dostępne testy</h2>
            <p className='text-gray-600 mb-6'>
              Wybierz test, aby rozpocząć naukę z kategorii {categoryName}
            </p>

            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
              {tests.slice(0, 12).map((test) => (
                <Link
                  key={test.id}
                  href={`/panel/testy/${decodedCategory}?sessionId=new`}
                  className='block p-4 bg-gray-50 rounded-lg hover:bg-blue-50 transition-colors border border-gray-200 hover:border-blue-300'
                >
                  <h3 className='font-medium text-gray-900 mb-2 line-clamp-2'>
                    {(test.data as any)?.question || 'Pytanie testowe'}
                  </h3>
                  <span className='text-sm text-blue-600 font-medium'>
                    Rozpocznij test →
                  </span>
                </Link>
              ))}
            </div>

            <div className='mt-6'>
              <Link
                href={`/panel/testy/${decodedCategory}?sessionId=new`}
                className='inline-block bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium'
              >
                Przejdź do wszystkich testów
              </Link>
            </div>
          </div>
        ) : (
          <div className='bg-white rounded-lg shadow-md p-8 text-center'>
            <p className='text-gray-600 mb-4'>
              Brak dostępnych testów w tej kategorii.
            </p>
            <Link
              href='/panel/kursy'
              className='inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors'
            >
              Wróć do moich kursów
            </Link>
          </div>
        )}
      </div>
    </section>
  )
}
