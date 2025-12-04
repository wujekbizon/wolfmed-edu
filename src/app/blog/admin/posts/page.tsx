import { getAllBlogPosts } from '@/server/queries'
import PostsManagementContent from '@/components/blog/admin/PostsManagementContent'


export default async function PostsManagementPage() {
  const posts = await getAllBlogPosts({ limit: 100,sortBy: 'createdAt'})

  return <PostsManagementContent posts={posts} />
}
