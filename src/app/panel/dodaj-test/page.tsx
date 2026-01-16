import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import CreateTestTabs from '@/components/CreateTestTabs'
import DeleteTestModal from '@/components/DeleteTestModal'
import DeleteCategoryModal from '@/components/DeleteCategoryModal'
import CategoryDeleteModalWrapper from '@/components/CategoryDeleteModalWrapper'
import { getCurrentUser } from '@/server/user'

export default async function CreateTestPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/sign-in')

  return (
    <section className="w-full h-full overflow-y-auto scrollbar-webkit p-4">
      <div className="flex w-full flex-col items-center justify-center gap-8 px-0 pb-10 sm:px-4 2xl:w-3/4 mx-auto">
        <Suspense fallback={<div className="text-center py-8">Ładowanie...</div>}>
          <CreateTestTabs userId={user.userId} />
        </Suspense>
      </div>
      <DeleteTestModal />
      <DeleteCategoryModal />
      <CategoryDeleteModalWrapper />
    </section>
  )
}
