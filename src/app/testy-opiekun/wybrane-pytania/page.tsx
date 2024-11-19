import { Metadata } from 'next'
import { fileData } from '@/server/fetchData'
import CustomCategoryManager from '@/components/CustomCategoryManager'
import CategoryManagerHeader from '@/components/CategoryManagerHeader'

export const dynamic = 'force-static'

export const metadata: Metadata = {
  title: 'Własne kategorie pytań - Testy Opiekuna Medycznego',
  description: 'Stwórz własne zestawy pytań i zarządzaj swoją bazą testów.',
}

export default async function SelectedQuestionsPage() {
  const tests = await fileData.getAllTests()

  if (!tests || tests.length === 0) {
    return <p>Brak dostępnych pytań. Proszę spróbować później.</p>
  }

  return (
    <section className="flex w-full flex-col items-center overflow-y-auto scrollbar-webkit p-1 sm:p-2 md:p-4">
      <div className="w-full lg:w-[90%] xl:w-[85%]">
        <div className="rounded-2xl border border-zinc-600/20 bg-white/80 backdrop-blur-md p-4 md:p-6 shadow-lg">
          <CategoryManagerHeader />
          <div className="mt-8">
            <CustomCategoryManager questions={tests} />
          </div>
        </div>
      </div>
    </section>
  )
}
