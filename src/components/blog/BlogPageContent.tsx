import AllPosts from '@/components/AllPosts'
import { getAllBlogPosts } from '@/server/queries'

export default async function BlogPageContent() {
  const posts = await getAllBlogPosts({
    status: 'published',
    sortBy: 'publishedAt',
    sortOrder: 'desc',
  })

  return <AllPosts posts={posts} />
}
