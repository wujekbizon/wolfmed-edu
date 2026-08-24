import { Suspense } from 'react'
import type { Metadata } from 'next'
import CourseProceduresContent from '@/components/CourseProceduresContent'
import ProceduresBrowserSkeleton from '@/components/skeletons/ProceduresBrowserSkeleton'
import { PROCEDURE_COURSE_METADATA } from '@/constants/procedureCourseMetadata'
import type { CourseProceduresPageProps } from '@/types/procedureBrowseTypes'

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

export async function generateMetadata({ params }: CourseProceduresPageProps): Promise<Metadata> {
  const { course } = await params
  return PROCEDURE_COURSE_METADATA[course] ?? { title: 'Procedury' }
}

export default async function CourseProceduresPage({ params }: CourseProceduresPageProps) {
  const { course } = await params
  return (
    <Suspense fallback={<ProceduresBrowserSkeleton />}>
      <CourseProceduresContent course={course} />
    </Suspense>
  )
}
