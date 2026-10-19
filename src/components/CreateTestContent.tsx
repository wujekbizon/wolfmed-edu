import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/server/user'
import { checkPremiumAccessAction } from '@/actions/course-actions'
import CreateTestTabs from '@/components/CreateTestTabs'
import CreateTestHeader from '@/components/CreateTestHeader'
import DeleteTestModal from '@/components/DeleteTestModal'
import DeleteCategoryModal from '@/components/DeleteCategoryModal'
import CategoryDeleteModalWrapper from '@/components/CategoryDeleteModalWrapper'
import PremiumAccessRequired from '@/components/PremiumAccessRequired'
import PracticeTestSkeleton from '@/components/skeletons/PracticeTestSkeleton'

export default async function CreateTestContent() {
  const user = await getCurrentUser()
  if (!user) redirect('/sign-in')

  const isPremium = await checkPremiumAccessAction()
  if (!isPremium) return <PremiumAccessRequired feature="create-test" />

  return (
    <>
      <div className="flex w-full flex-col gap-6 px-0 pb-10 sm:px-4 2xl:w-3/4 mx-auto">
        <CreateTestHeader />
        <Suspense fallback={<PracticeTestSkeleton />}>
          <CreateTestTabs userId={user.userId} />
        </Suspense>
      </div>
      <DeleteTestModal />
      <DeleteCategoryModal />
      <CategoryDeleteModalWrapper />
    </>
  )
}
