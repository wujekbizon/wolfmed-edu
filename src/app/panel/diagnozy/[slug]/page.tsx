import { redirect, notFound } from 'next/navigation'
import { Metadata } from 'next'
import { getCurrentUser } from '@/server/user'
import { hasDiagnozyAccess } from '@/helpers/hasDiagnozyAccess'
import { getDiagnozaBySlug, getUserDiagnozyCompletions } from '@/server/queries'
import DiagnozaTabs from '@/components/diagnozy/DiagnozaTabs'
import DiagnozaStudyView from '@/components/diagnozy/DiagnozaStudyView'
import WypelnijRunner from '@/components/diagnozy/wypelnij/WypelnijRunner'
import NoAccessMessage from '@/components/NoAccessMessage'

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const diagnoza = await getDiagnozaBySlug(slug)
  return {
    title: diagnoza ? `${diagnoza.section} ${diagnoza.title}` : 'Diagnozy i Interwencje',
  }
}

export default async function DiagnozaPage({ params }: Props) {
  const user = await getCurrentUser()
  if (!user) redirect('/')

  const hasAccess = await hasDiagnozyAccess()
  if (!hasAccess) return <NoAccessMessage />

  const { slug } = await params
  const [diagnoza, completedSlugs] = await Promise.all([
    getDiagnozaBySlug(slug),
    getUserDiagnozyCompletions(user.userId),
  ])
  if (!diagnoza) notFound()

  return (
    <section className="w-full h-full overflow-y-auto scrollbar-webkit p-4 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <header className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-700">
              {diagnoza.section}
            </span>
            <span className="text-xs text-zinc-400">
              {diagnoza.chapter.number}. {diagnoza.chapter.title}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-zinc-800">{diagnoza.title}</h1>
          {diagnoza.author && (
            <p className="text-xs text-zinc-400 mt-1">{diagnoza.author}</p>
          )}
        </header>

        <DiagnozaTabs
          nauka={<DiagnozaStudyView diagnoza={diagnoza} />}
          wypelnij={
            <WypelnijRunner
              diagnoza={diagnoza}
              alreadyCompleted={completedSlugs.includes(diagnoza.slug)}
            />
          }
        />
      </div>
    </section>
  )
}
