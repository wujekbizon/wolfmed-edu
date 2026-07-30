import { Suspense } from 'react'
import {
  getBlogStatistics,
  getAllBlogPosts,
  getMessageStats,
  getForumStats,
  getRecentForumPosts,
} from '@/server/queries'
import AdminBlogPanel from '@/components/AdminBlogPanel'
import AdminBlogPanelSkeleton from '@/components/skeletons/AdminBlogPanelSkeleton'


export const dynamic = 'force-dynamic'

async function AsyncAdminDashboard() {
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
