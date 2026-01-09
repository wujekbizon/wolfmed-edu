import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import { getAllBlogPosts, getBlogPostBySlug } from '@/server/queries'
import BlogPost from '@/app/_components/BlogPost'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const post = await getBlogPostBySlug(slug)

  if (!post) {
    return {
      title: 'Wolfmed Blog Medyczny',
    }
  }

  return {
    title: post.metaTitle || post.title,
    description: post.metaDescription || post.excerpt,
    keywords: post.metaKeywords || undefined,
  }
}

export const revalidate = 604800;

export async function generateStaticParams() {
  const posts = await getAllBlogPosts({
    status: 'published',
    sortBy: 'publishedAt',
    sortOrder: 'desc',
  })
  
  return posts.map((post) => ({
    slug: post.slug,
  }))
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = await getBlogPostBySlug(slug)

  if (!post) {
    notFound()
  }

  return <BlogPost post={post} />
}
