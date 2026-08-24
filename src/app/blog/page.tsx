import { Metadata } from 'next'
import { connection } from 'next/server'
import AllPosts from '@/components/AllPosts'
import { getAllBlogPosts } from '@/server/queries'

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

export const metadata: Metadata = {
  title: 'Wolfmed Blog Medyczny ',
  description:
    'Witaj na naszym blogu medycznym. Tutaj znajdziesz ciekawe informacje na temat opieki medycznej i przygotowania do egzaminu na opiekuna medycznego.',
  keywords:
    'opiekun, blog, porady, dieta, opieka, bezpieczeństwo, etyka, stres, komunikacja, higiena, egzamin, pomoc, rehabilitacja',
}

export default async function BlogPage() {
  await connection()

  const posts = await getAllBlogPosts({
    status: 'published',
    sortBy: 'publishedAt',
    sortOrder: 'desc',
  })

  return <AllPosts posts={posts} />
}
