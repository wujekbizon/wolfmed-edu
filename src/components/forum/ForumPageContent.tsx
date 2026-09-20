import ForumPosts from '@/components/ForumPosts'
import { getAllForumPosts } from '@/server/queries'

export default async function ForumPageContent() {
  const posts = await getAllForumPosts()

  return <ForumPosts posts={posts} />
}
