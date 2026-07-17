import { redirect } from 'next/navigation'
import { getProcedureBySlug } from '@/server/queries'
import PielegniastwoProcedureReader from '@/components/PielegniastwoProcedureReader'
import { Metadata } from 'next'
import type { PielegniastwoProcedure } from '@/types/pielegniastwoTypes'

interface Props {
  params: Promise<{ course: string; slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { course, slug } = await params
  if (course === 'pielegniarstwo') {
    const row = await getProcedureBySlug(course, slug)
    const procedure = row?.data as PielegniastwoProcedure | undefined
    return {
      title: procedure ? procedure.name : 'Procedura pielęgniarstwa',
      description: procedure
        ? `Procedura: ${procedure.name} — ${procedure.totalPoints} punktów`
        : undefined,
    }
  }
  return { title: 'Procedura' }
}

export default async function CourseProcedureDetailPage({ params }: Props) {
  const { course, slug } = await params

  if (course === 'pielegniarstwo') {
    const row = await getProcedureBySlug(course, slug)
    if (!row) redirect('/panel/procedury/pielegniarstwo')
    return <PielegniastwoProcedureReader procedure={row!.data as PielegniastwoProcedure} />
  }

  redirect(`/panel/procedury/${course}`)
}
