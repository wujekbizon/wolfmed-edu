import { redirect } from 'next/navigation'
import { Metadata } from 'next'
import { getCurrentUser } from '@/server/user'
import { hasDiagnozyAccess } from '@/helpers/hasDiagnozyAccess'
import { getAllDiagnozy, getUserDiagnozyExamAttempts } from '@/server/queries'
import EgzaminRunner from '@/components/diagnozy/egzamin/EgzaminRunner'
import EgzaminAttemptsList from '@/components/diagnozy/egzamin/EgzaminAttemptsList'
import NoAccessMessage from '@/components/NoAccessMessage'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Egzamin — Diagnozy i Interwencje',
  description:
    'Egzamin próbny z procesu pielęgnowania: wylosowany przypadek, wypełnienie przewodnika, ocena odpowiedzi',
}

export default async function DiagnozyEgzaminPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/')

  const hasAccess = await hasDiagnozyAccess()
  if (!hasAccess) return <NoAccessMessage />

  const [attempts, diagnozy] = await Promise.all([
    getUserDiagnozyExamAttempts(user.userId),
    getAllDiagnozy(),
  ])
  const titlesBySlug = Object.fromEntries(
    diagnozy.map((diagnoza) => [diagnoza.slug, `${diagnoza.section} ${diagnoza.title}`])
  )

  return (
    <section className="w-full h-full overflow-y-auto scrollbar-webkit p-4 lg:p-8">
      <div className="max-w-3xl mx-auto">
        <header className="mb-6">
          <h1 className="text-2xl font-bold text-zinc-800 mb-2">
            Egzamin — Diagnozy i Interwencje
          </h1>
          <p className="text-sm text-zinc-500">
            System losuje przypadek kliniczny. Przeczytaj opis, a następnie wypełnij
            przewodnik procesu pielęgnowania — tym razem wśród odpowiedzi są też
            pozycje z innych diagnoz, a odpowiedzi zostaną ocenione po zakończeniu.
            Masz 30 minut — po upływie czasu egzamin zostanie oceniony automatycznie.
          </p>
        </header>

        <EgzaminRunner />

        <EgzaminAttemptsList attempts={attempts} titlesBySlug={titlesBySlug} />
      </div>
    </section>
  )
}
