import { Metadata } from 'next'
import AllPosts from '@/components/AllPosts'
import { getAllBlogPosts } from '@/server/queries'

export const metadata: Metadata = {
  title: 'Wolfmed Blog Medyczny ',
  description:
    'Witaj na naszym blogu medycznym. Tutaj znajdziesz ciekawe informacje na temat opieki medycznej i przygotowania do egzaminu na opiekuna medycznego.',
  keywords:
    'opiekun, blog, porady, dieta, opieka, bezpieczeństwo, etyka, stres, komunikacja, higiena, egzamin, pomoc, rehabilitacja',
}

export default async function BlogPage() {

  const posts = await getAllBlogPosts({
    status: 'published',
    sortBy: 'publishedAt',
    sortOrder: 'desc',
  })

  return <AllPosts posts={posts} />
}
