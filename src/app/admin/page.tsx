import { Suspense } from 'react'
import { connection } from 'next/server'
import {
  getBlogStatistics,
  getAllBlogPosts,
  getMessageStats,
  getForumStats,
  getRecentForumPosts,
} from '@/server/queries'
import AdminBlogPanel from '@/components/AdminBlogPanel'
import AdminBlogPanelSkeleton from '@/components/skeletons/AdminBlogPanelSkeleton'


// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;


async function AsyncAdminDashboard() {
  await connection()

  const [stats, recentPosts, messageStats, forumStats, recentForumPosts] =
    await Promise.all([
      getBlogStatistics(),
      getAllBlogPosts({
        limit: 5,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      }),
      getMessageStats(),
      getForumStats(),
      getRecentForumPosts(5),
    ])

  return (
    <AdminBlogPanel
      stats={stats}
      recentPosts={recentPosts}
      messageStats={messageStats}
      forumStats={forumStats}
      recentForumPosts={recentForumPosts}
    />
  )
}

export default function AdminDashboardPage() {
  return (
    <Suspense fallback={<AdminBlogPanelSkeleton />}>
      <AsyncAdminDashboard />
    </Suspense>
  )
}
