import { fileData } from '@/server/fetchData'
import { Metadata } from 'next'
import CategoryGrid from '@/components/CategoryGrid'

export const dynamic = 'force-static'

export const metadata: Metadata = {
  title: 'Baza pytań Nauka',
  description:
    'Baza testów z egzaminów i kursów medycznych',
  keywords: 'nauka, egzamin, testy, pytania, zagadnienia, baza',
}

export default async function NaukaPage() {
  const categories = await fileData.getTestsCategories()
  const populatedCategories = await Promise.all(
    categories.map(async (cat) => {
      const count = await fileData.countTestsByCategory(cat.category)
      const categoryName = cat.category
        .replace(/-/g, ' ')
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      return { category: categoryName, value: cat.category, count }
    })
  )

  return <CategoryGrid categories={populatedCategories} />
}
