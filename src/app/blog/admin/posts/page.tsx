import { getAllBlogPosts } from '@/server/queries'
import PostsManagementContent from '@/components/blog/admin/PostsManagementContent'

export default async function PostsManagementPage() {
  const posts = await getAllBlogPosts({
    // Omit status to show all statuses
    limit: 100,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  })

  return <PostsManagementContent posts={posts} />
}
