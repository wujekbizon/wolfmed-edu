import Link from 'next/link'
import { CATEGORY_METADATA } from '@/constants/categoryMetadata'
import { hasAccessToTier } from '@/lib/accessTiers'
import type { AccessTier } from '@/types/categoryType'
import { CategoryCard } from './kursy/CategoryCard'

interface EnrolledCourse {
  id: string
  slug: string
  name: string
  description: string | null
  accessTier: string
  enrolledAt: Date
}

interface EnrolledCoursesListProps {
  courses: EnrolledCourse[]
}

export default function EnrolledCoursesList({ courses }: EnrolledCoursesListProps) {
  if (courses.length === 0) {
    return (
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-zinc-800 mb-2">Moje Kursy</h1>
        <p className="text-zinc-600 mb-6">
          Kursy, do których jesteś zapisany
        </p>
        <div className="bg-white rounded-2xl shadow-xl border border-zinc-200/60 p-8 text-center">
          <p className="text-zinc-600 mb-4">
            Nie jesteś zapisany do żadnego kursu.
          </p>
          <Link
            href="/panel"
            className="inline-block bg-zinc-600 text-white px-6 py-3 rounded-lg hover:bg-zinc-700 transition-colors font-medium"
          >
            Wróć do panelu
          </Link>
        </div>
      </div>
    )
  }

  const courseCategories = courses.map((course) => {
    const categories = Object.values(CATEGORY_METADATA).filter(
      (cat) => cat.course === course.slug
    )
    return {
      ...course,
      categories,
    }
  })

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-zinc-800 mb-2">Moje Kursy</h1>
      <p className="text-zinc-600 mb-8">
        Kursy, do których masz dostęp:
      </p>

      <div className="grid grid-cols-1 gap-6">
        {courseCategories.map((course) => (
          <div
            key={course.id}
            className="bg-white rounded-2xl shadow-xl border border-zinc-200/60 overflow-hidden hover:shadow-2xl transition-all duration-300"
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-zinc-800 mb-2">
                    {course.name}
                  </h2>
                  <p className="text-zinc-600">{course.description}</p>
                </div>
                <span className="bg-green-100 text-green-800 text-xs px-3 py-1 rounded-full whitespace-nowrap font-medium">
                  {course.accessTier}
                </span>
              </div>

              {course.categories.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-zinc-800 mb-3">
                    Kategorie testów:
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {course.categories.map((category) => {

                      return (
                        <CategoryCard
                          key={category.category}
                          category={category}
                          userTier={course.accessTier}
                        />
                      )
                    })}
                  </div>
                </div>
              )}

              <div className="mt-4 pt-4 border-t border-zinc-200 text-sm text-zinc-500">
                Dostęp od:{' '}
                {new Date(course.enrolledAt).toLocaleDateString('pl-PL')}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}