import AllForumPosts from '@/components/AllForumPosts'
import { getAllPosts } from '@/server/fileArchive'

export default async function ForumPage() {
  const posts = await getAllPosts()

  return <AllForumPosts posts={posts} />
}
