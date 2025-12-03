import type { BlogPost } from '@/types/dataTypes'
import Link from 'next/link'
import Image from 'next/image'
import { formatDate } from '@/helpers/formatDate'
import { DEFAULT_BLOG_IMAGE } from '@/constants/blog'

type BlogPostProps = {
  post: BlogPost
}

export default function BlogPost({ post }: BlogPostProps) {
  const parseContent = (content: string) => {

    const sections = content.split(/\n\n+/)

    return sections.map((section, index) => {
      const trimmed = section.trim()
      if (!trimmed) return null

      if (trimmed.startsWith('# ')) {
        return (
          <h2 key={index} className="text-2xl sm:text-3xl font-bold text-[#E6E6F5] mt-12 mb-6">
            {trimmed.replace('# ', '')}
          </h2>
        )
      }
      if (trimmed.startsWith('## ')) {
        return (
          <h3 key={index} className="text-xl sm:text-2xl font-bold text-[#E6E6F5] mt-8 mb-4">
            {trimmed.replace('## ', '')}
          </h3>
        )
      }

      if (/^\d+\./.test(trimmed)) {
        const items = trimmed.split(/\n(?=\d+\.)/).filter(Boolean)
        return (
          <ol key={index} className="list-decimal list-inside space-y-2 mb-6 text-[#A5A5C3] leading-relaxed">
            {items.map((item, i) => (
              <li key={i} className="text-base sm:text-lg">
                {item.replace(/^\d+\.\s*/, '')}
              </li>
            ))}
          </ol>
        )
      }

      if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        const items = trimmed.split(/\n(?=[-*]\s)/).filter(Boolean)
        return (
          <ul key={index} className="list-disc list-inside space-y-2 mb-6 text-[#A5A5C3] leading-relaxed">
            {items.map((item, i) => (
              <li key={i} className="text-base sm:text-lg">
                {item.replace(/^[-*]\s*/, '')}
              </li>
            ))}
          </ul>
        )
      }

      return (
        <p key={index} className="mb-6 text-base sm:text-lg leading-relaxed text-[#A5A5C3]">
          {trimmed.split('\n').map((line, i, arr) => (
            <span key={i}>
              {line}
              {i < arr.length - 1 && <br />}
            </span>
          ))}
        </p>
      )
    }).filter(Boolean)
  }

  return (
    <section className="min-h-screen w-full p-4 sm:p-8">
      <div className="w-full max-w-5xl mx-auto">
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 mb-6 px-5 py-2.5 rounded-full bg-[#2A2A3F] border border-[#3A3A5A] text-[#E6E6F5] hover:text-[#BB86FC] hover:border-[#BB86FC]/50 font-medium text-sm transition-all duration-300"
        >
          <span className="hover:-translate-x-1 transition-transform">←</span>
          Powrót do bloga
        </Link>

        <article className="bg-[#2A2A3F] rounded-2xl shadow-2xl border border-[#3A3A5A] overflow-hidden">
          <div className="relative w-full h-64 sm:h-80 md:h-96 bg-gradient-to-br from-[#3A3A5E] to-[#30304B]">
            <Image src={post.coverImage || DEFAULT_BLOG_IMAGE} alt={post.title} fill className="object-cover" priority />
            <div className="absolute inset-0 bg-gradient-to-t from-[#1F1F2D]/80 via-transparent to-transparent" />
          </div>

          <div className="p-6 sm:p-8 md:p-12 lg:p-16">
            <header className="mb-10">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#E6E6F5] mb-6 leading-tight">
                {post.title}
              </h1>

              <div className="flex flex-wrap items-center gap-4 pb-6 border-b border-[#3A3A5A]">
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
                      <time className="text-xs text-[#A5A5C3]">
                        {formatDate(post.publishedAt?.toISOString() || post.date || new Date().toISOString())}
                      </time>
                    </div>
                  </div>
                )}
                {!post.authorName && (
                  <time className="text-sm text-[#A5A5C3]">
                    {formatDate(post.publishedAt?.toISOString() || post.date || new Date().toISOString())}
                  </time>
                )}

                <div className="flex flex-wrap items-center gap-3 text-sm text-[#A5A5C3]">
                  {post.readingTime && (
                    <span>{post.readingTime} min czytania</span>
                  )}
                  {post.readingTime && post.viewCount > 0 && <span className="text-[#3A3A5A]">•</span>}
                  {post.viewCount > 0 && (
                    <span>{post.viewCount} wyświetleń</span>
                  )}
                </div>
              </div>
            </header>

            <div className="prose prose-zinc prose-lg max-w-none">
              {parseContent(post.content)}
            </div>

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
