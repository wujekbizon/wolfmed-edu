import type { BlogPost } from '@/types/dataTypes'
import Link from 'next/link'
import Image from 'next/image'
import { DEFAULT_BLOG_IMAGE } from '@/constants/blog'
import RelativeTime from '@/components/RelativeTime'
import MarkdownRenderer from '@/components/MarkdownRenderer'

type BlogPostProps = {
  post: BlogPost
}

export default function BlogPost({ post }: BlogPostProps) {
  return (
    <section className="min-h-screen w-full p-2 sm:p-4 md:p-6 lg:p-8 bg-[#09060c]/95">
      <div className="w-full max-w-6xl mx-auto">
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 mb-6 px-5 py-2.5 rounded-full bg-[#2A2A3F] border border-[#3A3A5A] text-[#E6E6F5] hover:text-[#BB86FC] hover:border-[#BB86FC]/50 font-medium text-sm transition-all duration-300"
        >
          <span className="hover:-translate-x-1 transition-transform">←</span>
          Powrót do bloga
        </Link>

        <article className="bg-[#2A2A3F] rounded-2xl shadow-2xl border border-[#3A3A5A] overflow-hidden">
          <div className="relative w-full h-64 sm:h-80 md:h-96 bg-linear-to-br from-[#3A3A5E] to-[#30304B]">
            <Image 
              src={post.coverImage || DEFAULT_BLOG_IMAGE} 
              alt={post.title} 
              fill 
              className="object-cover" 
              priority 
            />
            <div className="absolute inset-0 bg-linear-to-t from-[#1F1F2D]/80 via-transparent to-transparent" />
          </div>

          <div className="p-6 sm:p-8 md:p-12 lg:p-16">
            <header className="mb-10">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#E6E6F5] mb-6 leading-tight">
                {post.title}
              </h1>

              <div className="w-full flex flex-wrap justify-start items-end gap-4 pb-6 border-b border-[#3A3A5A]">
                <div className="w-full flex flex-row items-center justify-between gap-3">
                  {post.authorName && (
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-linear-to-br from-[#BB86FC]/20 to-[#8686D7]/20 border border-[#BB86FC]/30 flex items-center justify-center">
                        <span className="text-[#BB86FC] font-semibold text-base">
                          {post.authorName
                            .split(' ')
                            .map((n) => n[0])
                            .join('')
                            .toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[#E6E6F5]">{post.authorName}</p>
                        <RelativeTime 
                          date={post.publishedAt?.toISOString() || post.date || new Date().toISOString()}
                          className="text-xs text-[#A5A5C3]"
                        />
                      </div>
                    </div>
                  )}
                  {!post.authorName && (
                    <RelativeTime 
                      date={post.publishedAt?.toISOString() || post.date || new Date().toISOString()}
                      className="text-sm text-[#A5A5C3]"
                    />
                  )}

                  {post.viewCount > 0 && (
                    <div className="flex items-center gap-2 text-sm text-[#A5A5C3]">
                      <svg className="w-4 h-4" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                        <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      <span>{post.viewCount} wyświetleń</span>
                    </div>
                  )}
                </div>

                {post.readingTime && (
                  <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#BB86FC]/10 border border-[#BB86FC]/20">
                    <svg className="w-5 h-5 text-[#BB86FC]" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                      <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-sm font-medium text-[#BB86FC]">{post.readingTime} min czytania</span>
                  </div>
                )}
              </div>
            </header>

            <MarkdownRenderer content={post.content} />

            <div className="mt-16 pt-8 border-t border-[#3A3A5A]">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-6 p-8 rounded-xl bg-linear-to-br from-[#BB86FC]/5 to-[#8686D7]/5 border border-[#BB86FC]/20">
                <div>
                  <h3 className="text-lg font-semibold text-[#E6E6F5] mb-2">Podobał Ci się artykuł?</h3>
                  <p className="text-sm text-[#A5A5C3]">Odkryj więcej artykułów medycznych</p>
                </div>
                <Link
                  href="/blog"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#BB86FC] hover:bg-[#8686D7] text-[#1F1F2D] font-semibold text-sm shadow-lg hover:shadow-xl hover:shadow-[#BB86FC]/20 transition-all duration-300 hover:scale-105"
                >
                  Zobacz więcej
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </Link>
              </div>
            </div>
          </div>
        </article>
      </div>
    </section>
  )
}