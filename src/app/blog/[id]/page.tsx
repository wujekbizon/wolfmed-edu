import { notFound } from 'next/navigation'
import BlogPost from '@/app/_components/BlogPost'
import { Metadata } from 'next'
import { getPostById } from '@/server/queries'
import { PostProps } from '@/types/dataTypes'
import { Suspense } from 'react'
import TestLoader from '@/components/TestsLoader'

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

async function Post({ id }: { id: string }) {
  const post = await getPostById(id)

  if (!post) {
    notFound()
  }

  return <BlogPost post={post} />
}

export default function BlogPostPage({ params }: PostProps) {
  return (
    <Suspense fallback={<TestLoader />}>
      <Post id={params.id} />
    </Suspense>
  )
}
