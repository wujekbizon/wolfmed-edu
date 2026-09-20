import ForumPageShell from '@/components/forum/ForumPageShell'
import ForumPostsSkeleton from '@/components/skeletons/ForumPostsSkeleton'

export default function Loading() {
  return (
    <ForumPageShell>
      <ForumPostsSkeleton />
    </ForumPageShell>
  )
}
