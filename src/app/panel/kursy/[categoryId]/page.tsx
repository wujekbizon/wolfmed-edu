import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { Metadata } from 'next'
import { getCurrentUser } from '@/server/user'
import { countTestsByCategory } from '@/server/queries'
import { checkCourseAccessAction } from '@/actions/course-actions'
import { CATEGORY_METADATA, DEFAULT_CATEGORY_METADATA } from '@/constants/categoryMetadata'
import { hasAccessToTier } from '@/helpers/accessTiers'
import CategoryDetailView from '@/components/CategoryDetailView'
import NoAccessMessage from '@/components/NoAccessMessage'
import TierUpgradeMessage from '@/components/TierUpgradeMessage'
import CategoryDetailSkeleton from '@/components/skeletons/CategoryDetailSkeleton'

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

async function CategoryContent({ categoryId }: { categoryId: string }) {
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
      return <NoAccessMessage />
    }

    const hasTierAccess = hasAccessToTier(userTier, categoryData.requiredTier)
    if (!hasTierAccess) {
      return (
        <TierUpgradeMessage requiredTier={categoryData.requiredTier} userTier={userTier} />
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
    <CategoryDetailView
      categoryData={categoryData}
      categoryName={categoryName}
      testCount={testCount}
      decodedCategory={decodedCategory}
    />
  )
}

export default async function CategoryDetailPage({ params }: CategoryPageProps) {
  const { categoryId } = await params

  return (
    <section className='w-full h-full overflow-y-auto scrollbar-webkit p-4 lg:p-16'>
      <Suspense fallback={<CategoryDetailSkeleton />}>
        <CategoryContent categoryId={categoryId} />
      </Suspense>
    </section>
  )
}
