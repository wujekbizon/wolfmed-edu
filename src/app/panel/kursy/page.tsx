import { redirect } from 'next/navigation'
import { Metadata } from 'next'
import { getCurrentUser } from '@/server/user'
import { getUserEnrolledCourses } from '@/server/queries'
import { CATEGORY_METADATA } from '@/constants/categoryMetadata'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Moje Kursy',
  description: 'Przeglądaj kursy, do których jesteś zapisany',
  keywords: 'kursy, szkolenia, opiekun medyczny, pielęgniarstwo',
}

export default async function KursyPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/sign-in')

  const enrolledCourses = await getUserEnrolledCourses(user.userId)

  // Group categories by course from CATEGORY_METADATA
  const courseCategories = enrolledCourses.map((course) => {
    const categories = Object.values(CATEGORY_METADATA).filter(
      (cat) => cat.course === course.slug
    )
    return {
      ...course,
      categories,
    }
  })

  if (enrolledCourses.length === 0) {
    return (
      <section className='w-full h-full overflow-y-auto scrollbar-webkit p-4 lg:p-16'>
        <div className='max-w-4xl mx-auto'>
          <h1 className='text-3xl font-bold mb-6'>Moje Kursy</h1>
          <div className='bg-white rounded-lg shadow p-8 text-center'>
            <p className='text-gray-600 mb-4'>
              Nie jesteś zapisany do żadnego kursu.
            </p>
            <Link
              href='/panel'
              className='inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors'
            >
              Wróć do panelu
            </Link>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className='w-full h-full overflow-y-auto scrollbar-webkit p-4 lg:p-16'>
      <div className='max-w-6xl mx-auto'>
        <h1 className='text-3xl font-bold mb-2'>Moje Kursy</h1>
        <p className='text-gray-600 mb-8'>
          Kursy, do których jesteś zapisany ({enrolledCourses.length})
        </p>

        <div className='grid grid-cols-1 gap-6'>
          {courseCategories.map((course) => (
            <div
              key={course.id}
              className='bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow'
            >
              <div className='p-6'>
                <div className='flex items-start justify-between mb-4'>
                  <div>
                    <h2 className='text-2xl font-bold mb-2'>{course.name}</h2>
                    <p className='text-gray-600'>{course.description}</p>
                  </div>
                  <span className='bg-green-100 text-green-800 text-xs px-3 py-1 rounded-full whitespace-nowrap'>
                    {course.accessTier}
                  </span>
                </div>

                {course.categories.length > 0 && (
                  <div className='mt-6'>
                    <h3 className='text-lg font-semibold mb-3'>Kategorie testów:</h3>
                    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3'>
                      {course.categories.map((category) => (
                        <Link
                          key={category.category}
                          href={`/panel/kursy/${category.category}`}
                          className='group block p-4 bg-gray-50 rounded-lg hover:bg-blue-50 transition-colors border border-gray-200 hover:border-blue-300'
                        >
                          <div className='flex items-center gap-3'>
                            {category.image && (
                              <img
                                src={category.image}
                                alt={category.category}
                                className='w-12 h-12 rounded object-cover'
                              />
                            )}
                            <div className='flex-1 min-w-0'>
                              <h4 className='font-medium text-gray-900 group-hover:text-blue-600 transition-colors capitalize truncate'>
                                {category.category.replace(/-/g, ' ')}
                              </h4>
                              <p className='text-sm text-gray-500 truncate'>
                                {category.popularity}
                              </p>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                <div className='mt-4 pt-4 border-t border-gray-200 text-sm text-gray-500'>
                  Zapisany od: {new Date(course.enrolledAt).toLocaleDateString('pl-PL')}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
