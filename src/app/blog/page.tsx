import { Metadata } from 'next'
import { getAllPosts } from '@/server/queries'
import { Post } from '@/types/dataTypes'
import AllPosts from '@/components/AllPosts'

export const metadata: Metadata = {
  title: 'Wolfmed Blog Medyczny ',
  description:
    'Witaj na naszym blogu medycznym. Tutaj znajdziesz ciekawe informacje na temat opieki medycznej i przygotowania do egzaminu na opiekuna medycznego.',
  keywords:
    'opiekun, blog, porady, dieta, opieka, bezpieczeństwo, etyka, stres, komunikacja, higiena, egzamin, pomoc, rehabilitacja',
}

export default async function BlogPage() {
  const posts = (await getAllPosts()) as Post[]
  return <AllPosts posts={posts} />
}
