import { getUserCustomCategories } from '@/server/queries'
import { fileData } from '@/server/fetchData'
import { getPopulatedCategories } from "@/helpers/populateCategories"
import TabNavigation from "@/components/TabNavigation"
import CreateTab from "@/components/CreateTab"
import ManageTab from "@/components/ManageTab"
import DocumentationTab from "@/components/DocumentationTab"
import CustomCategoriesTab from "@/components/CustomCategoriesTab"
import { isUserAdmin } from '@/lib/adminHelpers'

interface Props {
  userId: string
}

export default async function CreateTestTabs({ userId }: Props) {
  const isAdmin = await isUserAdmin()

  const populatedCategories = await getPopulatedCategories(fileData, userId)

  // Hide socjologia for non-admins
  const categories = isAdmin
    ? populatedCategories
    : populatedCategories.filter(cat => cat.value !== 'socjologia')

  const userCustomCategories = await getUserCustomCategories(userId)
  const allTests = await fileData.mergedGetAllTests(userId)

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
    },
    // {
    //   id: "custom-categories",
    //   label: "Wybrane pytania",
    //   content: <CustomCategoriesTab
    //     initialCategories={userCustomCategories}
    //     questions={allTests}
    //   />
    // }
  ]

  return <TabNavigation tabs={tabs} />
}
