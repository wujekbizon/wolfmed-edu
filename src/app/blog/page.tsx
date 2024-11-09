import { Metadata } from 'next'
import AllPosts from '@/components/AllPosts'
import { fileData } from '@/server/fetchData'

export const dynamic = 'force-static'

export const metadata: Metadata = {
  title: 'Wolfmed Blog Medyczny ',
  description:
    'Witaj na naszym blogu medycznym. Tutaj znajdziesz ciekawe informacje na temat opieki medycznej i przygotowania do egzaminu na opiekuna medycznego.',
  keywords:
    'opiekun, blog, porady, dieta, opieka, bezpieczeństwo, etyka, stres, komunikacja, higiena, egzamin, pomoc, rehabilitacja',
}

export default async function BlogPage() {
  // file data
  const posts = await fileData.getAllPosts()
  return <AllPosts posts={posts} />
}
