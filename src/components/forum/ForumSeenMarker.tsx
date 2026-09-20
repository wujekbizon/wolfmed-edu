import { auth } from '@clerk/nextjs/server'
import MarkForumSeen from '@/components/MarkForumSeen'
import { getForumNotifications } from '@/server/queries'

export default async function ForumSeenMarker() {
  const { userId } = await auth()
  if (!userId) return null

  const { newPosts } = await getForumNotifications(userId)
  return <MarkForumSeen scope="posts" hasUnread={newPosts > 0} />
}
