import { notFound } from 'next/navigation'
import BlogPost from '@/app/_components/BlogPost'
import { Metadata } from 'next'
import { getPostById } from '@/server/queries'
import { PostProps } from '@/types/dataTypes'

export const dynamic = 'force-static'

export async function generateMetadata({ params }: PostProps): Promise<Metadata> {
  const post = await getPostById(params.id)

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

export default async function BlogPostPage({ params }: PostProps) {
  const post = await getPostById(params.id)

  if (!post) {
    notFound()
  }
  return <BlogPost post={post} />
}
