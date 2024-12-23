import PostList from '../_components/PostList'
import CreatePostButton from '../_components/CreatePostButton'
import { getAllPosts } from '@/server/fileArchive'

export default async function ForumPage() {
  // temporary read this data from the file
  const posts = await getAllPosts()

  return (
    <main className="min-h-screen w-full max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col xs:flex-row justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-zinc-500">Forum dyskusyjne</h1>
        <CreatePostButton />
      </div>
      <PostList posts={posts} />
    </main>
  )
}
