import { redirect } from 'next/navigation'
import { Metadata } from 'next'
import { getCurrentUser } from '@/server/user'
import { countTestsByCategory } from '@/server/queries'
import { checkCourseAccessAction } from '@/actions/course-actions'
import { CATEGORY_METADATA, DEFAULT_CATEGORY_METADATA } from '@/constants/categoryMetadata'
import { hasAccessToTier } from '@/lib/accessTiers'
import Link from 'next/link'
import { Presentation, Users, BookOpen } from 'lucide-react'
import ProgramTopicItem from '@/components/ProgramTopicItem'

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

  const categoryData = CATEGORY_METADATA[decodedCategory] || {
    ...DEFAULT_CATEGORY_METADATA,
    category: decodedCategory,
    course: '',
  }
  let hasAccess = false
  let userTier = 'free'

  if (categoryData.course) {
    const courseAccess = await checkCourseAccessAction(categoryData.course)
    hasAccess = courseAccess.hasAccess
    userTier = courseAccess.accessTier || 'free'

    if (!hasAccess) {
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

    const hasTierAccess = hasAccessToTier(userTier, categoryData.requiredTier)
    if (!hasTierAccess) {
      return (
        <section className='w-full h-full overflow-y-auto scrollbar-webkit p-4 lg:p-16'>
          <div className='max-w-4xl mx-auto'>
            <div className='bg-white rounded-lg shadow p-8'>
              <h2 className='text-2xl font-bold text-orange-600 mb-4'>🔒 Wymagana wyższa wersja</h2>
              <p className='text-gray-600 mb-4'>
                Ta kategoria wymaga pakietu <span className='font-semibold'>{categoryData.requiredTier}</span>.
              </p>
              <p className='text-gray-600 mb-6'>
                Twój aktualny pakiet: <span className='font-semibold'>{userTier}</span>
              </p>
              <div className='flex gap-4'>
                <Link
                  href='/panel/kursy'
                  className='inline-block bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors'
                >
                  Wróć do moich kursów
                </Link>
                <Link
                  href='#'
                  className='inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors'
                >
                  Ulepsz pakiet
                </Link>
              </div>
            </div>
          </div>
        </section>
      )
    }
  }

  const testCount = await countTestsByCategory(decodedCategory)

  const categoryName = decodedCategory
    .replace(/-/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')

  return (
    <section className='w-full h-full overflow-y-auto scrollbar-webkit p-4 lg:p-16'>
      <div className='max-w-6xl mx-auto'>
        <nav className='mb-6 text-sm'>
          <Link href='/panel/kursy' className='text-blue-600 hover:underline'>
            Moje Kursy
          </Link>
          <span className='mx-2 text-gray-400'>/</span>
          <span className='text-gray-600'>{categoryName}</span>
        </nav>

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

        {categoryData.details ? (
          <>

            <div className='bg-white rounded-lg shadow-md p-6 md:p-8 mb-6'>
              <div className='grid md:grid-cols-2 gap-6 mb-6'>
                <div>
                  <h3 className='text-sm font-semibold text-zinc-500 uppercase tracking-wide mb-2'>Informacje o przedmiocie</h3>
                  <div className='space-y-2'>
                    <p className='text-gray-700'><span className='font-semibold'>ECTS:</span> {categoryData.details.ects}</p>
                    <p className='text-gray-700'><span className='font-semibold'>Semestr:</span> {categoryData.details.semester}</p>
                  </div>
                </div>
                <div>
                  <h3 className='text-sm font-semibold text-zinc-500 uppercase tracking-wide mb-2'>Co powinieneś już wiedzieć?</h3>
                  <p className='text-gray-700'>{categoryData.details.prerequisites || 'Brak'}</p>
                </div>
              </div>

              <div>
                <h3 className='text-sm font-semibold text-zinc-500 uppercase tracking-wide mb-2'>O czym jest ten kurs?</h3>
                <p className='text-gray-700 leading-relaxed'>{categoryData.details.objectives}</p>
              </div>
            </div>

            {/* Learning Outcomes */}
            <div className='bg-white rounded-lg shadow-md p-6 md:p-8 mb-6'>
              <h2 className='text-2xl font-bold mb-6'>Czego się nauczysz?</h2>

              {/* Knowledge */}
              {categoryData.details.learningOutcomes.knowledge.length > 0 && (
                <div className='mb-6'>
                  <h3 className='text-lg font-semibold text-zinc-700 mb-3'>Wiedza</h3>
                  <div className='space-y-3'>
                    {categoryData.details.learningOutcomes.knowledge.map((item, idx) => (
                      <div key={idx} className='flex gap-3 p-3 bg-zinc-50 rounded-lg border border-zinc-200'>
                        <span className='font-mono text-sm font-bold text-zinc-700 shrink-0'>{item.code}</span>
                        <p className='text-gray-700 text-sm'>{item.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Skills */}
              {categoryData.details.learningOutcomes.skills.length > 0 && (
                <div className='mb-6'>
                  <h3 className='text-lg font-semibold text-slate-700 mb-3'>Umiejętności</h3>
                  <div className='space-y-3'>
                    {categoryData.details.learningOutcomes.skills.map((item, idx) => (
                      <div key={idx} className='flex gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200'>
                        <span className='font-mono text-sm font-bold text-slate-700 shrink-0'>{item.code}</span>
                        <p className='text-gray-700 text-sm'>{item.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Competencies */}
              {categoryData.details.learningOutcomes.competencies && categoryData.details.learningOutcomes.competencies.length > 0 && (
                <div>
                  <h3 className='text-lg font-semibold text-zinc-700 mb-3'>Kompetencje społeczne</h3>
                  <div className='space-y-3'>
                    {categoryData.details.learningOutcomes.competencies.map((item, idx) => (
                      <div key={idx} className='flex gap-3 p-3 bg-zinc-50 rounded-lg border border-zinc-200'>
                        <span className='font-mono text-sm font-bold text-zinc-700 shrink-0'>{item.code}</span>
                        <p className='text-gray-700 text-sm'>{item.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Program Content */}
            <div className='bg-white rounded-lg shadow-md p-6 md:p-8 mb-6'>
              <h2 className='text-2xl font-bold mb-6'>Program kursu</h2>

              {/* Lectures */}
              {categoryData.details.programContent.lectures.length > 0 && (
                <div className='mb-6'>
                  <div className='flex items-center gap-2 mb-3'>
                    <Presentation className='w-5 h-5 text-zinc-600' />
                    <h3 className='text-lg font-semibold text-gray-800'>Podstawy teoretyczne</h3>
                  </div>
                  <ul className='space-y-2'>
                    {categoryData.details.programContent.lectures.map((item, idx) => (
                      <ProgramTopicItem key={idx} item={item} categoryId={decodedCategory} />
                    ))}
                  </ul>
                </div>
              )}

              {/* Seminars */}
              {categoryData.details.programContent.seminars.length > 0 && (
                <div className='mb-6'>
                  <div className='flex items-center gap-2 mb-3'>
                    <Users className='w-5 h-5 text-slate-600' />
                    <h3 className='text-lg font-semibold text-gray-800'>Praktyczne zastosowanie</h3>
                  </div>
                  <ul className='space-y-2'>
                    {categoryData.details.programContent.seminars.map((item, idx) => (
                      <ProgramTopicItem key={idx} item={item} categoryId={decodedCategory} />
                    ))}
                  </ul>
                </div>
              )}
              {categoryData.details.programContent.selfStudy.length > 0 && (
                <div>
                  <div className='flex items-center gap-2 mb-3'>
                    <BookOpen className='w-5 h-5 text-zinc-600' />
                    <h3 className='text-lg font-semibold text-gray-800'>Wiedza rozszerzona</h3>
                  </div>
                  <ul className='space-y-2'>
                    {categoryData.details.programContent.selfStudy.map((item, idx) => (
                      <ProgramTopicItem key={idx} item={item} categoryId={decodedCategory} />
                    ))}
                  </ul>
                </div>
              )}
            </div>
            <div className='bg-white rounded-lg shadow-md p-8'>
              <h2 className='text-2xl font-bold mb-4'>Rozpocznij naukę</h2>
              <p className='text-gray-600 mb-6'>
                Gotowy do sprawdzenia swojej wiedzy? Rozpocznij egzamin z kategorii {categoryName}
              </p>
              <Link
                href="/panel/testy"
                className='inline-block bg-slate-700 text-white px-8 py-3 rounded-lg hover:bg-slate-800 transition-colors font-medium'
              >
                Rozpocznij Egzamin
              </Link>
            </div>
          </>
        ) : (
          <div className='bg-white rounded-lg shadow-md p-8'>
            <h2 className='text-2xl font-bold mb-4'>Rozpocznij naukę</h2>
            <p className='text-gray-600 mb-6'>
              Gotowy do sprawdzenia swojej wiedzy? Rozpocznij egzamin z kategorii {categoryName}
            </p>
            <Link
              href="/panel/testy"
              className='inline-block bg-slate-600 text-white px-8 py-3 rounded-lg hover:bg-slate-900 transition-colors font-medium'
            >
              Rozpocznij Egzamin
            </Link>
          </div>
        )}
      </div>
    </section>
  )
}
