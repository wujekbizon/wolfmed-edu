import { Post } from '@/types/dataTypes'
import Link from 'next/link'

type BlogPostProps = {
  post: Post
}

export default function BlogPost({ post }: BlogPostProps) {
  return (
    <section className="min-h-[calc(100vh_-_70px)] w-full flex flex-col items-center justify-start p-8 bg-[#fff5f5]">
      <article className="w-full lg:w-2/3 xl:w-1/2 bg-white rounded-2xl p-8 shadow-md border border-red-200/40">
        <h1 className="text-3xl font-bold text-zinc-900 mb-4">{post.title}</h1>
        <p className="text-sm text-zinc-500 mb-6">{post.date}</p>
        <div className="prose prose-zinc max-w-none">
          {post.content.split('\n').map((paragraph, index) => (
            <p key={index} className="mb-4">
              {paragraph}
            </p>
          ))}
        </div>
        <Link
          href="/blog"
          className="mt-8 inline-block bg-[#ffb1b1] hover:text-[#fffcfc] border border-red-100/50 shadow-sm shadow-zinc-400 text-sm font-semibold py-[9px] px-4 rounded-full hover:bg-[#ffa5a5] transition-colors text-zinc-900 text-center"
        >
          ← Powrót do listy postów
        </Link>
      </article>
    </section>
  )
}
