import Link from 'next/link'
import BlogPostList from '@/app/_components/BlogPostList'

export default function Blog() {
  return (
    <section className="min-h-[calc(100vh_-_70px)] w-full flex flex-col items-center justify-start p-8 bg-gradient-to-t from-[rgb(245,212,207)] to-[#e8b8b1] rounded-br-[46px] bg-top rounded-bl-[46px]">
      <div className="w-full lg:w-2/3 xl:w-1/2 mb-8">
        <h1 className="text-4xl font-bold text-zinc-900 mb-4">Blog Medyczny</h1>
        <p className="text-lg text-zinc-700">
          Witaj na naszym blogu medycznym. Tutaj znajdziesz ciekawe informacje na temat opieki medycznej i przygotowania
          do egzaminu na opiekuna medycznego.
        </p>
      </div>
      <BlogPostList />
      <Link
        className="mt-8 bg-[#ffb1b1] hover:text-[#fffcfc] border border-red-100/50 shadow-sm shadow-zinc-400 text-sm font-semibold py-[9px] px-4 rounded-full hover:bg-[#ffa5a5] transition-colors text-zinc-900 text-center"
        href="/"
      >
        Powrót do strony głównej
      </Link>
    </section>
  )
}
