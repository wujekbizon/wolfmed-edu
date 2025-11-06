import { getAllBlogPosts } from '@/server/queries'
import PostsManagementContent from '@/components/blog/admin/PostsManagementContent'

export default async function PostsManagementPage() {
  const posts = await getAllBlogPosts({
    status: undefined, // Show all statuses
    limit: 100,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  })

  return <PostsManagementContent posts={posts} />
}
