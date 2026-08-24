import { redirect } from 'next/navigation'
import { getProcedureBySlug } from '@/server/queries'
import PielegniastwoProcedureReader from '@/components/PielegniastwoProcedureReader'
import OpiekunProcedureReader from '@/components/opiekunReader/OpiekunProcedureReader'
import { Metadata } from 'next'
import type { PielegniastwoProcedure } from '@/types/pielegniastwoTypes'
import type { Procedure } from '@/types/dataTypes'

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

interface Props {
  params: Promise<{ course: string; slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { course, slug } = await params
  const row = await getProcedureBySlug(course, slug)
  if (!row) return { title: 'Procedura' }

  if (course === 'pielegniarstwo') {
    const procedure = row.data as PielegniastwoProcedure
    return {
      title: procedure.name,
      description: `Procedura: ${procedure.name} — ${procedure.totalPoints} punktów`,
    }
  }

  const procedure = row.data as Procedure['data']
  return {
    title: procedure.name,
    description: `Procedura: ${procedure.name} — algorytm krok po kroku`,
  }
}

export default async function CourseProcedureDetailPage({ params }: Props) {
  const { course, slug } = await params

  const row = await getProcedureBySlug(course, slug)
  if (!row) redirect(`/panel/procedury/${course}`)

  if (course === 'pielegniarstwo') {
    return (
      <PielegniastwoProcedureReader procedure={row!.data as PielegniastwoProcedure} />
    )
  }

  if (course === 'opiekun-medyczny') {
    return (
      <OpiekunProcedureReader
        procedure={{ id: row!.id, data: row!.data as Procedure['data'] }}
        slug={slug}
      />
    )
  }

  redirect('/panel/procedury')
}
