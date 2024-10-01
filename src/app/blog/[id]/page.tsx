import { notFound } from 'next/navigation'
import BlogPost from '@/app/_components/BlogPost'
import { blogPosts } from '@/data/blogPosts'

export const dynamic = 'force-static'

export async function generateStaticParams() {
  return blogPosts.map((post) => ({
    id: post.id,
  }))
}

export default function BlogPostPage({ params }: { params: { id: string } }) {
  const post = blogPosts.find((p) => p.id === params.id)

  if (!post) {
    notFound()
  }

  return (
    <div className="min-h-[calc(100vh_-_70px)] w-full flex flex-col items-center justify-start p-8 bg-[#fff5f5]">
      <BlogPost post={post} />
    </div>
  )
}
