import { Suspense } from 'react'
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { getSupporterByUserId } from '@/server/queries'
import CreateTestTabs from '@/components/CreateTestTabs'
import DeleteTestModal from '@/components/DeleteTestModal'
import DeleteCategoryModal from '@/components/DeleteCategoryModal'
import CategoryDeleteModalWrapper from '@/components/CategoryDeleteModalWrapper'
import SupporterRequired from '@/components/SupporterRequired'

export default async function CreateTestPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const isSupporter = await getSupporterByUserId(userId)
  if (!isSupporter) {
    return <SupporterRequired />
  }

  return (
    <section className="w-full h-full overflow-y-auto scrollbar-webkit p-4">
      <div className="flex w-full flex-col items-center justify-center gap-8 px-0 pb-10 sm:px-4 2xl:w-3/4 mx-auto">
        <Suspense fallback={<div className="text-center py-8">Ładowanie...</div>}>
          <CreateTestTabs userId={userId} />
        </Suspense>
      </div>
      <DeleteTestModal />
      <DeleteCategoryModal />
      <CategoryDeleteModalWrapper />
    </section>
  )
}
