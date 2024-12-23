import PostList from '../_components/PostList'
import CreatePostButton from '../_components/CreatePostButton'
import { getAllPosts } from '@/server/fileArchive'

export default async function ForumPage() {
  const posts = await getAllPosts()

  return (
    <main className="min-h-screen w-full max-w-7xl mx-auto px-0 xs:px-4 py-0 xs:py-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-12 bg-zinc-900 p-4 xs:p-6 rounded-lg">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-red-200 to-red-500 bg-clip-text text-transparent">
            Forum dyskusyjne
          </h1>
          <p className="text-zinc-300 text-sm font-light mt-2">
            Dołącz do dyskusji i dziel się swoimi doświadczeniami z innymi opiekunami
          </p>
        </div>
        <CreatePostButton />
      </div>
      <PostList posts={posts} />
    </main>
  )
}
