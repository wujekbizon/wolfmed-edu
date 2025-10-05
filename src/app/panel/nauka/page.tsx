import { fileData } from '@/server/fetchData'
import { Metadata } from 'next'
import CategoryGrid from '@/components/CategoryGrid'
import { getPopulatedCategories } from '@/helpers/populateCategories'
import LearningHubDashboard from '@/components/LearningHubDashboard'

export const dynamic = 'force-static'

export const metadata: Metadata = {
  title: 'Baza pytań Nauka',
  description:
    'Baza testów z egzaminów i kursów medycznych',
  keywords: 'nauka, egzamin, testy, pytania, zagadnienia, baza',
}

export default async function NaukaPage() {
  const populatedCategories = await getPopulatedCategories(fileData)

  return (
    <section className='w-full h-full overflow-y-auto scrollbar-webkit p-4 lg:p-16 bg-linear-to-br from-zinc-50/80 via-rose-50/30 to-zinc-50/80'>
      <LearningHubDashboard categories={populatedCategories} />
    </section>
  )
}
