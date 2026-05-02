import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/server/user'
import { getUserEnrolledCourses, getAllProcedures } from '@/server/queries'
import { getAllPielegniastwoProcedures } from '@/lib/pielegniastwoUtils'
import AllProcedures from '@/components/AllProcedures'
import PielegniastwoProceduresList from '@/components/PielegniastwoProceduresList'
import { Metadata } from 'next'

export const dynamic = 'force-dynamic'

const COURSE_METADATA: Record<string, Metadata> = {
  'opiekun-medyczny': {
    title: 'Procedury Opiekuna Medycznego',
    description: 'Lista procedur i algorytmów dla opiekuna medycznego',
  },
  pielegniarstwo: {
    title: 'Podstawy Pielęgniarstwa — Procedury',
    description: 'Lista procedur z podstaw pielęgniarstwa',
  },
}

interface Props {
  params: Promise<{ course: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { course } = await params
  return COURSE_METADATA[course] ?? { title: 'Procedury' }
}

export default async function CourseProceduresPage({ params }: Props) {
  const user = await getCurrentUser()
  if (!user) redirect('/sign-in')

  const { course } = await params
  const courses = await getUserEnrolledCourses(user.id)
  const isEnrolled = courses.some((c) => c.slug === course)
  if (!isEnrolled) redirect('/panel/procedury')

  if (course === 'opiekun-medyczny') {
    const procedures = await getAllProcedures()
    return <AllProcedures procedures={procedures as any} />
  }

  if (course === 'pielegniarstwo') {
    const procedures = getAllPielegniastwoProcedures()
    return <PielegniastwoProceduresList procedures={procedures} />
  }

  redirect('/panel/procedury')
}
