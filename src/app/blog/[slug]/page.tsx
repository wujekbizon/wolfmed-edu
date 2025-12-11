import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { getBlogPostBySlug } from '@/server/queries'
import BlogPost from '@/app/_components/BlogPost'
import AllBlogPostsSkeleton from '@/components/skeletons/AllBlogPostsSkeleton'


export const metadata = {
    title: 'Wolfmed Blog Medyczny',
    description: 'Artykuł medyczny na blogu Wolfmed.',
}

async function BlogPostContent(props: { params: Promise<{ slug: string }> }) {
  const { slug } = await props.params
  const post = await getBlogPostBySlug(slug)

  if (!post) {
    notFound()
  }

  return <BlogPost post={post} />
}

export default function BlogPostPage(props: { params: Promise<{ slug: string }> }) {
  return (
    <Suspense fallback={<AllBlogPostsSkeleton />}>
      <BlogPostContent params={props.params} />
    </Suspense>
  )
}
