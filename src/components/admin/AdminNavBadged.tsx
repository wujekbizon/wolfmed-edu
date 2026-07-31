import { auth } from '@clerk/nextjs/server'
import { getMessageStats, getForumNotifications } from '@/server/queries'
import AdminNav from './AdminNav'
import type { AdminNavVariant } from '@/types/adminNavTypes'

export default async function AdminNavBadged({
  variant,
}: {
  variant: AdminNavVariant
}) {
  const { userId } = await auth()
  if (!userId) return <AdminNav variant={variant} />

  const [messageStats, forumNotifications] = await Promise.all([
    getMessageStats(),
    getForumNotifications(userId),
  ])

  return (
    <AdminNav
      variant={variant}
      badges={{
        messages: messageStats.unread,
        forum: forumNotifications.newPosts,
      }}
    />
  )
}
