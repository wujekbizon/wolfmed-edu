import { Metadata } from 'next'
import { getAllPosts } from '@/server/queries'
import { Post } from '@/types/dataTypes'
import { Suspense } from 'react'
import TestLoader from '@/components/TestsLoader'
import BlogPostList from '../_components/BlogPostList'
import HomeButton from '@/components/HomeButton'

export const metadata: Metadata = {
  title: 'Wolfmed Blog Medyczny ',
  description:
    'Witaj na naszym blogu medycznym. Tutaj znajdziesz ciekawe informacje na temat opieki medycznej i przygotowania do egzaminu na opiekuna medycznego.',
  keywords:
    'opiekun, blog, porady, dieta, opieka, bezpieczeństwo, etyka, stres, komunikacja, higiena, egzamin, pomoc, rehabilitacja',
}

export const dynamic = 'force-static'

export default async function BlogPage() {
  const posts = (await getAllPosts()) as Post[]
  return (
    <section className="min-h-screen w-full bg-gradient-to-b from-[#f5d4cf] via-[#e8b8b1] to-[#f5d4cf] rounded-br-3xl sm:rounded-br-[50px] rounded-bl-3xl sm:rounded-bl-[50px]">
      <div className="max-w-7xl mx-auto px-0 xs:px-6 lg:px-8 py-4 xs:py-12 ">
        <div className="bg-black bg-opacity-50 p-4 sm:p-8 mb-0 xs:mb-12 xs:rounded-3xl">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-2 sm:mb-4 text-center">
            Blog Medyczny
          </h1>
          <p className="text-sm sm:text-base md:text-xl text-white max-w-xs sm:max-w-lg md:max-w-2xl mx-auto text-center">
            Odkryj fascynujący świat opieki medycznej i przygotuj się do egzaminu na opiekuna medycznego z naszymi
            eksperckimi artykułami.
          </p>
        </div>

        <div className="bg-zinc-50 xs:rounded-3xl shadow-xl p-4 md:p-8 mb-4 xs:mb-12">
          <h2 className="text-2xl sm:text-3xl font-semibold text-zinc-800 mb-4 sm:mb-6 text-center">
            Najnowsze Artykuły
          </h2>

          <div className="flex justify-center">
            <BlogPostList posts={posts} />
          </div>
        </div>
        <HomeButton title="Powrót do strony głównej" />
      </div>
    </section>
  )
}
