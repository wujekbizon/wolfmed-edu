import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { getSupporterByUserId } from '@/server/queries'
import { fileData } from '@/server/fetchData'
import ChooseAnswerCount from "@/components/ChooseAnswerCount"
import CreateTestForm from "@/components/CreateTestForm"
import UploadTestForm from "@/components/UploadTestForm"
import { JsonDocumentation } from "@/components/JsonDocumentation"
import { getPopulatedCategories } from "@/helpers/populateCategories"

async function CreateTests() {
  const { userId } = await auth()
  if (!userId) return null

  const categories = await getPopulatedCategories(fileData, userId)

  return (
    <>
      <CreateTestForm categories={categories} />
    </>
  )
}

export default async function CreateTestPage() {
  // 1. Authentication check
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  // 2. Supporter gate
  const isSupporter = await getSupporterByUserId(userId)
  if (!isSupporter) {
    redirect('/wsparcie-projektu')
  }

  return (
    <section className="w-full h-full overflow-y-auto scrollbar-webkit p-4">
      <div className="flex w-full flex-col items-center justify-center gap-8 px-0 pb-10 sm:px-4 lg:w-3/4 mx-auto">
        <ChooseAnswerCount />
        <CreateTests />
        <UploadTestForm />
        <JsonDocumentation />
      </div>
    </section>
  )
}
