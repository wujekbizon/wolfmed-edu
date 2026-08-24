import { Suspense } from 'react'
import type { Metadata } from 'next'
import CourseProceduresContent from '@/components/CourseProceduresContent'
import ProceduresBrowserSkeleton from '@/components/skeletons/ProceduresBrowserSkeleton'
import { PROCEDURE_COURSE_METADATA } from '@/constants/procedureCourseMetadata'
import type { CourseProceduresPageProps } from '@/types/procedureBrowseTypes'

export const instant = true

export async function generateMetadata({ params }: CourseProceduresPageProps): Promise<Metadata> {
  const { course } = await params
  return PROCEDURE_COURSE_METADATA[course] ?? { title: 'Procedury' }
}

export default function CourseProceduresPage({ params }: CourseProceduresPageProps) {
  return (
    <Suspense fallback={<ProceduresBrowserSkeleton />}>
      <CourseProceduresContent params={params} />
    </Suspense>
  )
}
