import { Suspense } from 'react'
import CreateTestContent from '@/components/CreateTestContent'
import PracticeTestSkeleton from '@/components/skeletons/PracticeTestSkeleton'

export default function CreateTestPage() {
  return (
    <section className="w-full h-full overflow-y-auto scrollbar-webkit p-4">
      <Suspense fallback={<PracticeTestSkeleton />}>
        <CreateTestContent />
      </Suspense>
    </section>
  )
}
