import { Suspense } from 'react'
import type { Metadata } from 'next'
import TestsByCategoryContent from '@/components/TestsByCategoryContent'
import AllTestsSkeleton from '@/components/skeletons/AllTestsSkeleton'
import { formatCategoryName } from '@/helpers/formatCategoryName'
import type { CategoryPageProps } from '@/types/categoryPageTypes'

export const instant = true

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { category } = await params
  const categoryName = formatCategoryName(decodeURIComponent(category))
  return {
    title: `Testy z kategorii: ${categoryName}`,
    description: `Przygotuj się do egzaminu z testów z kategorii ${categoryName}.`,
  }
}

export default function CategoryPage({ params }: CategoryPageProps) {
  return (
    <section className="flex w-full flex-col items-center gap-8 p-4 lg:p-16">
      <Suspense fallback={<AllTestsSkeleton />}>
        <TestsByCategoryContent params={params} />
      </Suspense>
    </section>
  )
}
