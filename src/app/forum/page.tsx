import ForumPosts from '@/components/ForumPosts'
import { getAllForumPosts } from '@/server/queries'
import { Suspense } from 'react'

export const experimental_ppr = true

export default async function ForumPage() {
  const posts = await getAllForumPosts()

  return (
    <Suspense fallback={<p>Loading...</p>}>
      <ForumPosts posts={posts} />
    </Suspense>
  )
}
