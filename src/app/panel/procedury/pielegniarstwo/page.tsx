import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/server/user'
import { getUserEnrolledCourses } from '@/server/queries'
import { getAllPielegniastwoProcedures } from '@/lib/pielegniastwoUtils'
import PielegniastwoProceduresList from '@/components/PielegniastwoProceduresList'
import { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Podstawy Pielęgniarstwa — Procedury',
  description: 'Lista procedur z podstaw pielęgniarstwa',
}

export default async function PielegniastwoProceduresPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/sign-in')

  const courses = await getUserEnrolledCourses(user.id)
  const hasPielegniarstwo = courses.some((c) => c.slug === 'pielegniarstwo')
  if (!hasPielegniarstwo) redirect('/panel/procedury')

  const procedures = getAllPielegniastwoProcedures()
  return <PielegniastwoProceduresList procedures={procedures} />
}
