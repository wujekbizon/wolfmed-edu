import { getAllBlogPosts } from '@/server/queries'
import PostsManagementContent from '@/components/admin/PostsManagementContent'

export const dynamic = 'force-dynamic'

export default async function PostsManagementPage() {
  const posts = await getAllBlogPosts({ limit: 100,sortBy: 'createdAt'})

  return <PostsManagementContent posts={posts} />
}
