import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Metadata } from 'next'
import { GraduationCap } from 'lucide-react'
import { getCurrentUser } from '@/server/user'
import { hasDiagnozyAccess } from '@/helpers/hasDiagnozyAccess'
import { getAllDiagnozy, getUserDiagnozyCompletions } from '@/server/queries'
import { groupDiagnozyByChapter } from '@/helpers/groupDiagnozyByChapter'
import DiagnozyChapterGroup from '@/components/diagnozy/DiagnozyChapterGroup'
import NoAccessMessage from '@/components/NoAccessMessage'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Diagnozy i Interwencje',
  description:
    'Diagnozy pielęgniarskie z interwencjami — nauka i wypełnianie procesu pielęgnowania',
}

export default async function DiagnozyPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/')

  const hasAccess = await hasDiagnozyAccess()
  if (!hasAccess) return <NoAccessMessage />

  const [diagnozy, completedSlugs] = await Promise.all([
    getAllDiagnozy(),
    getUserDiagnozyCompletions(user.userId),
  ])
  const chapters = groupDiagnozyByChapter(diagnozy)

  return (
    <section className="w-full h-full overflow-y-auto scrollbar-webkit p-4 lg:p-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-zinc-800 mb-2">
              Diagnozy i Interwencje
            </h1>
            <p className="text-sm text-zinc-500 max-w-2xl">
              Diagnozy pielęgniarskie na podstawie podręcznika „Diagnozy i interwencje w
              praktyce pielęgniarskiej”. Przeczytaj opracowanie, a następnie wypełnij
              przewodnik procesu pielęgnowania, wybierając właściwe elementy.
            </p>
          </div>
          <Link
            href="/panel/diagnozy/egzamin"
            className="shrink-0 inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-full
              text-white bg-rose-500 hover:bg-rose-600 transition-colors"
          >
            <GraduationCap className="w-4 h-4" />
            Egzamin próbny
          </Link>
        </header>

        {chapters.length === 0 ? (
          <div className="bg-white rounded-2xl border border-zinc-200 p-8 text-center text-zinc-500">
            Wkrótce więcej diagnoz.
          </div>
        ) : (
          <div className="flex flex-col gap-10">
            {chapters.map((chapter) => (
              <DiagnozyChapterGroup
                key={chapter.number}
                chapter={chapter}
                completedSlugs={completedSlugs}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
