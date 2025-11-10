import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { getSupporterByUserId } from '@/server/queries'
import { fileData } from '@/server/fetchData'
import { getPopulatedCategories } from "@/helpers/populateCategories"
import TabNavigation from "@/components/TabNavigation"
import CreateTab from "@/components/CreateTab"
import ManageTab from "@/components/ManageTab"
import DocumentationTab from "@/components/DocumentationTab"
import DeleteTestModal from "@/components/DeleteTestModal"
import DeleteCategoryModal from "@/components/DeleteCategoryModal"

export default async function CreateTestPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const isSupporter = await getSupporterByUserId(userId)
  if (!isSupporter) {
    redirect('/wsparcie-projektu')
  }

  const categories = await getPopulatedCategories(fileData, userId)

  const tabs = [
    {
      id: "create",
      label: "Tworzenie",
      content: <CreateTab categories={categories} />
    },
    {
      id: "manage",
      label: "Zarządzanie",
      content: <ManageTab userId={userId} />
    },
    {
      id: "documentation",
      label: "Dokumentacja",
      content: <DocumentationTab />
    }
  ]

  return (
    <section className="w-full h-full overflow-y-auto scrollbar-webkit p-4">
      <div className="flex w-full flex-col items-center justify-center gap-8 px-0 pb-10 sm:px-4 2xl:w-3/4 mx-auto">
        <TabNavigation tabs={tabs} />
      </div>
      <DeleteTestModal />
      <DeleteCategoryModal />
    </section>
  )
}
