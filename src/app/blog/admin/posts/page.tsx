import { Suspense } from 'react'
import { getAllBlogPosts } from '@/server/queries'
import PostsManagementContent from '@/components/blog/admin/PostsManagementContent'

async function PostsManagementWithData() {
  const posts = await getAllBlogPosts({ limit: 100, sortBy: 'createdAt' })
  return <PostsManagementContent posts={posts} />
}

export default function PostsManagementPage() {
  return (
    <Suspense fallback={<div className="animate-pulse">Ładowanie postów...</div>}>
      <PostsManagementWithData />
    </Suspense>
  )
}
