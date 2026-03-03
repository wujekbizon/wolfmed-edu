import { getUserCustomCategories } from '@/server/queries'
import { getPopulatedCategories } from "@/helpers/populateCategories"
import TabNavigation from "@/components/TabNavigation"
import CreateTab from "@/components/CreateTab"
import ManageTab from "@/components/ManageTab"
import CustomCategoriesTab from "@/components/CustomCategoriesTab"
import { auth } from "@clerk/nextjs/server"


interface Props {
  userId: string
}

export default async function CreateTestTabs({ userId }: Props) {

  const categories = await getPopulatedCategories()

  const { sessionClaims } = await auth()
  const isAdmin = (sessionClaims?.metadata as { role?: string })?.role === 'admin'

  const tabs = [
    {
      id: "create",
      label: "Tworzenie",
      content: <CreateTab categories={categories} isAdmin={isAdmin} />
    },
    {
      id: "manage",
      label: "Zarządzanie",
      content: <ManageTab userId={userId} />
    },
  ]

  return <TabNavigation tabs={tabs} />
}
