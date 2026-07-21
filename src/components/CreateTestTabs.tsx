import { getAccessibleCategories } from "@/helpers/populateCategories"
import TabNavigation from "@/components/TabNavigation"
import CreateTab from "@/components/CreateTab"
import ManageTab from "@/components/ManageTab"
import AITestGenerator from "@/components/aiTests/AITestGenerator"
import { auth } from "@clerk/nextjs/server"

interface Props {
  userId: string
}

export default async function CreateTestTabs({ userId }: Props) {

  const categories = await getAccessibleCategories()

  const { sessionClaims } = await auth()
  const isAdmin = (sessionClaims?.metadata as { role?: string })?.role === 'admin'

  const tabs = [
    {
      id: "create",
      label: "Tworzenie Testu",
      content: <CreateTab categories={categories} isAdmin={isAdmin} />
    },
    {
      id: "ai",
      label: "Generuj AI",
      content: <AITestGenerator categories={categories} />
    },
    {
      id: "manage",
      label: "Zarządzanie Testami",
      content: <ManageTab userId={userId} />
    },
  ]

  return <TabNavigation tabs={tabs} />
}