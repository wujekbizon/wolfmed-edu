import { Post } from '@/types/dataTypes'
import Link from 'next/link'

type BlogPostProps = {
  post: Post
}

export default function BlogPost({ post }: BlogPostProps) {
  return (
    <section className="min-h-screen w-full flex flex-col items-center justify-start p-4 sm:p-8 bg-linear-to-b from-[#f5d4cf] via-[#e8b8b1] to-[#f5d4cf] rounded-br-3xl sm:rounded-br-[50px] rounded-bl-3xl sm:rounded-bl-[50px]">
      <article className="w-full max-w-3xl bg-white rounded-2xl p-6 sm:p-8 shadow-lg border border-red-200/40">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-zinc-900 mb-4">{post.title}</h1>
        <div className="text-sm text-zinc-500 mb-6">
          <span>{post.date}</span>
        </div>
        <div className="prose prose-zinc max-w-none">
          {post.content.split('\n').map((paragraph, index) => (
            <p key={index} className="mb-4 text-base sm:text-lg leading-relaxed">
              {paragraph}
            </p>
          ))}
        </div>
        <Link
          href="/blog"
          className="mt-8 inline-block bg-[#ffb1b1] hover:bg-[#ffa5a5] text-zinc-900 hover:text-white border border-red-100/50 shadow-sm text-sm font-semibold py-2 px-4 rounded-full transition-colors"
        >
          Powrót do listy postów
        </Link>
      </article>
    </section>
  )
}
