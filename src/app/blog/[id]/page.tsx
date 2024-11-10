import { notFound } from 'next/navigation'
import BlogPost from '@/app/_components/BlogPost'
import { Metadata } from 'next'
import { fileData } from '@/server/fetchData'

export const dynamic = 'force-static'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const post = await fileData.getPostById(id)

  if (!post) {
    return {
      title: 'Wolfmed Blog Medyczny',
    }
  }

  return {
    title: post.title,
    description: post.excerpt,
  }
}

export default async function BlogPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const post = await fileData.getPostById(id)

  if (!post) {
    notFound()
  }
  return <BlogPost post={post} />
}
