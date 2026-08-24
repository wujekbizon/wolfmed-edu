import { getAllBlogPosts } from '@/server/queries'
import PostsManagementContent from '@/components/admin/PostsManagementContent'

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

export default async function PostsManagementPage() {
  const posts = await getAllBlogPosts({ limit: 100,sortBy: 'createdAt'})

  return <PostsManagementContent posts={posts} />
}
