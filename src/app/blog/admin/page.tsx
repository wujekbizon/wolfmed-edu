import { Suspense } from 'react'
import { getBlogStatistics, getAllBlogPosts, getMessageStats } from '@/server/queries'
import AdminBlogPanel from '@/components/AdminBlogPanel'
import AdminBlogPanelSkeleton from '@/components/skeletons/AdminBlogPanelSkeleton'

async function AsyncAdminDashboard() {
  const [stats, recentPosts, messageStats] = await Promise.all([
    getBlogStatistics(),
    getAllBlogPosts({
      limit: 5,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    }),
    getMessageStats(),
  ])

  return <AdminBlogPanel stats={stats} recentPosts={recentPosts} messageStats={messageStats} />
}

export default function AdminDashboardPage() {
  return (
    <Suspense fallback={<AdminBlogPanelSkeleton />}>
      <AsyncAdminDashboard />
    </Suspense>
  )
}
