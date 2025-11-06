import { Metadata } from 'next'
import AllPosts from '@/components/AllPosts'
import { getAllBlogPosts } from '@/server/queries/blogQueries'

export const metadata: Metadata = {
  title: 'Wolfmed Blog Medyczny ',
  description:
    'Witaj na naszym blogu medycznym. Tutaj znajdziesz ciekawe informacje na temat opieki medycznej i przygotowania do egzaminu na opiekuna medycznego.',
  keywords:
    'opiekun, blog, porady, dieta, opieka, bezpieczeństwo, etyka, stres, komunikacja, higiena, egzamin, pomoc, rehabilitacja',
}

export default async function BlogPage() {
  // Fetch published blog posts from database
  const posts = await getAllBlogPosts({
    status: 'published',
    sortBy: 'publishedAt',
    sortOrder: 'desc',
  })

  // Transform to match old Post type for AllPosts component
  const transformedPosts = posts.map((post) => ({
    id: post.id,
    title: post.title,
    date: post.date || post.publishedAt?.toISOString().split('T')[0] || '',
    excerpt: post.excerpt,
    content: post.content,
    createdAt: post.createdAt,
    updatedAt: post.updatedAt,
  }))

  return <AllPosts posts={transformedPosts} />
}
