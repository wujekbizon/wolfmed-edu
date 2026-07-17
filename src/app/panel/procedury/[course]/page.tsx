import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/server/user'
import { getUserEnrolledCourses, getAllProcedures } from '@/server/queries'
import AllProcedures from '@/components/AllProcedures'
import PielegniastwoProceduresList from '@/components/PielegniastwoProceduresList'
import { Metadata } from 'next'
import type { PielegniastwoProcedure } from '@/types/pielegniastwoTypes'

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
  if (!user) redirect('/')

  const { course } = await params
  const courses = await getUserEnrolledCourses(user.userId)
  const isEnrolled = courses.some((c) => c.slug === course)
  if (!isEnrolled) redirect('/panel/procedury')

  if (course === 'opiekun-medyczny') {
    const procedures = await getAllProcedures(course)
    return <AllProcedures procedures={procedures as any} />
  }

  if (course === 'pielegniarstwo') {
    const rows = await getAllProcedures(course)
    const procedures = rows.map((row) => row.data as PielegniastwoProcedure)
    return <PielegniastwoProceduresList procedures={procedures} />
  }

  redirect('/panel/procedury')
}
