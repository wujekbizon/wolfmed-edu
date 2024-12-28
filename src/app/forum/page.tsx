import ForumPosts from '@/components/ForumPosts'
import { getAllPosts } from '@/server/fileArchive'
import { Suspense } from 'react'

export const experimental_ppr = true

export default async function ForumPage() {
  const posts = await getAllPosts() // temp getting all posts from json file

  return (
    <Suspense fallback={<p>Loading...</p>}>
      <ForumPosts posts={posts} />
    </Suspense>
  )
}
