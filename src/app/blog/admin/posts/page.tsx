import { getAllBlogPosts } from '@/server/queries'
import PostsManagementContent from '@/components/blog/admin/PostsManagementContent'

// Force dynamic rendering for admin pages (requires auth check)
export const dynamic = 'force-dynamic'

export default async function PostsManagementPage() {
  const posts = await getAllBlogPosts({
    // Omit status to show all statuses
    limit: 100,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  })

  return <PostsManagementContent posts={posts} />
}
