import { fileData } from '@/server/fetchData'
import { Metadata } from 'next'
import CategoryGrid from '@/components/CategoryGrid'
import { getPopulatedCategories } from '@/helpers/populateCategories'

export const dynamic = 'force-static'

export const metadata: Metadata = {
  title: 'Baza pytań Nauka',
  description:
    'Baza testów z egzaminów i kursów medycznych',
  keywords: 'nauka, egzamin, testy, pytania, zagadnienia, baza',
}

export default async function NaukaPage() {
  const populatedCategories = await getPopulatedCategories(fileData)

  return <CategoryGrid categories={populatedCategories} />
}
