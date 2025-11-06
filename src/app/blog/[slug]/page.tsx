import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import { getBlogPostBySlug } from '@/server/queries'
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

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = await getBlogPostBySlug(slug)

  if (!post) {
    notFound()
  }

  // Transform BlogPost to Post type for BlogPost component
  const transformedPost = {
    id: post.id,
    title: post.title,
    slug: post.slug,
    date: post.date || post.publishedAt?.toISOString().split('T')[0] || '',
    excerpt: post.excerpt,
    content: post.content,
    createdAt: post.createdAt,
    updatedAt: post.updatedAt,
  }

  return <BlogPost post={transformedPost} />
}
