import { Suspense } from 'react'
import { auth } from '@clerk/nextjs/server'
import {
  getForumStats,
  getRecentForumPosts,
  getForumNotifications,
} from '@/server/queries'
import MarkForumSeen from '@/components/MarkForumSeen'
import { ADMIN_FORUM_PAGE_SIZE } from '@/constants/forumNotifications'
import AdminForumPostList from '@/components/admin/AdminForumPostList'
import AdminForumPostListSkeleton from '@/components/skeletons/AdminForumPostListSkeleton'
import AdminForumStats from '@/components/admin/AdminForumStats'
import AdminForumStatsSkeleton from '@/components/skeletons/AdminForumStatsSkeleton'

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

export const metadata = {
  title: 'Forum - Admin Panel',
  robots: 'noindex, nofollow',
}

async function AsyncForumStats() {
  return <AdminForumStats stats={await getForumStats()} />
}

async function ForumSeenMarker() {
  const { userId } = await auth()
  if (!userId) return null

  const { newPosts } = await getForumNotifications(userId)
  return <MarkForumSeen scope="posts" hasUnread={newPosts > 0} />
}

async function AsyncForumPosts({ page }: { page: number }) {
  const [posts, stats] = await Promise.all([
    getRecentForumPosts(ADMIN_FORUM_PAGE_SIZE, (page - 1) * ADMIN_FORUM_PAGE_SIZE),
    getForumStats(),
  ])

  return (
    <AdminForumPostList
      posts={posts}
      page={page}
      totalPages={Math.max(1, Math.ceil(stats.total / ADMIN_FORUM_PAGE_SIZE))}
    />
  )
}

export default async function AdminForumPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const { page } = await searchParams
  const currentPage = Math.max(1, Number(page) || 1)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-zinc-900">Forum</h1>
        <p className="text-zinc-600 mt-2">
          Wszystkie posty użytkowników i aktywność w dyskusjach
        </p>
      </div>

      <Suspense fallback={<AdminForumStatsSkeleton />}>
        <AsyncForumStats />
      </Suspense>

      <Suspense key={currentPage} fallback={<AdminForumPostListSkeleton />}>
        <AsyncForumPosts page={currentPage} />
      </Suspense>

      <Suspense fallback={null}>
        <ForumSeenMarker />
      </Suspense>
    </div>
  )
}
