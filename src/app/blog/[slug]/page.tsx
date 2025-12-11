import { Suspense } from 'react'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getBlogPostBySlug } from '@/server/queries'
import BlogPost from '@/app/_components/BlogPost'
import AllBlogPostsSkeleton from '@/components/skeletons/AllBlogPostsSkeleton'

// export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
//   const { slug } = await params
//   const post = await getBlogPostBySlug(slug)

//   if (!post) {
//     return {
//       title: 'Wolfmed Blog Medyczny',
//     }
//   }

//   return {
//     title: post.metaTitle || post.title,
//     description: post.metaDescription || post.excerpt,
//     keywords: post.metaKeywords || undefined,
//   }
// }

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
