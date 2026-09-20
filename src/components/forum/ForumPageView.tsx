import { Suspense } from 'react'
import ForumPageContent from '@/components/forum/ForumPageContent'
import ForumPageShell from '@/components/forum/ForumPageShell'
import ForumSeenMarker from '@/components/forum/ForumSeenMarker'
import ForumPostsSkeleton from '@/components/skeletons/ForumPostsSkeleton'

export default function ForumPageView() {
  return (
    <>
      <ForumPageShell>
        <Suspense fallback={<ForumPostsSkeleton />}>
          <ForumPageContent />
        </Suspense>
      </ForumPageShell>
      <Suspense fallback={null}>
        <ForumSeenMarker />
      </Suspense>
    </>
  )
}
