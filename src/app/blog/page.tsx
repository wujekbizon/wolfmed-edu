import { Metadata } from 'next'
import { getAllPosts } from '@/server/queries'
import { Post } from '@/types/dataTypes'
import { Suspense } from 'react'
import TestLoader from '@/components/TestsLoader'
import BlogPostList from '../_components/BlogPostList'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Wolfmed Blog Medyczny ',
  description:
    'Witaj na naszym blogu medycznym. Tutaj znajdziesz ciekawe informacje na temat opieki medycznej i przygotowania do egzaminu na opiekuna medycznego.',
  keywords:
    'opiekun, blog, porady, dieta, opieka, bezpieczeństwo, etyka, stres, komunikacja, higiena, egzamin, pomoc, rehabilitacja',
}

export const dynamic = 'force-static'

async function Posts() {
  const posts = (await getAllPosts()) as Post[]
  return <BlogPostList posts={posts} />
}

export default function BlogPage() {
  return (
    <section className="min-h-[calc(100vh_-_70px)] w-full flex flex-col items-center justify-start p-8 bg-gradient-to-t from-[rgb(245,212,207)] to-[#e8b8b1] rounded-br-[46px] bg-top rounded-bl-[46px]">
      <div className="w-full lg:w-2/3 xl:w-1/2 mb-8">
        <h1 className="text-4xl font-bold text-zinc-900 mb-4">Blog Medyczny</h1>
        <p className="text-lg text-zinc-700">
          Witaj na naszym blogu medycznym. Tutaj znajdziesz ciekawe informacje na temat opieki medycznej i przygotowania
          do egzaminu na opiekuna medycznego.
        </p>
      </div>
      <Suspense fallback={<TestLoader />}>
        <Posts />
      </Suspense>
      <Link
        className="mt-8 bg-[#ffb1b1] hover:text-[#fffcfc] border border-red-100/50 shadow-sm shadow-zinc-400 text-sm font-semibold py-[9px] px-4 rounded-full hover:bg-[#ffa5a5] transition-colors text-zinc-900 text-center"
        href="/"
      >
        Powrót do strony głównej
      </Link>
    </section>
  )
}
