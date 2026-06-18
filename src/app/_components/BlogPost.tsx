import React from 'react'
import type { BlogPost } from '@/types/dataTypes'
import Link from 'next/link'
import Image from 'next/image'
import { formatDate } from '@/helpers/formatDate'
import { DEFAULT_BLOG_IMAGE } from '@/constants/blog'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { Components, ExtraProps } from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { ChevronRight } from 'lucide-react'
import { nodeText, resolveH3 } from '@/helpers/blogMarkdown'
import BlogBackground from '@/components/blog/BlogBackground'

type BlogPostProps = {
  post: BlogPost
}

export default function BlogPost({ post }: BlogPostProps) {
  const markdownComponents: Components = {
    h1: ({ children }) => (
      <h1 className="text-3xl sm:text-4xl font-bold text-[#E6E6F5] mt-12 mb-8 leading-tight">{children}</h1>
    ),
    h2: ({ children }) => (
      <div className="mt-16 mb-8">
        <div className="flex items-center gap-4 mb-5">
          <span className="shrink-0 w-1 h-8 rounded-full bg-[#BB86FC]" />
          <h2 className="text-xl sm:text-2xl font-bold text-[#E6E6F5] uppercase tracking-[0.12em]">{children}</h2>
        </div>
        <div className="h-px bg-gradient-to-r from-[#BB86FC]/40 via-[#3A3A5A] to-transparent" />
      </div>
    ),
    h3: ({ children }) => {
      const { Icon, colors, label } = resolveH3(nodeText(children))
      return (
        <div className={`flex items-center gap-3 px-5 py-3.5 rounded-r-xl border-l-4 font-semibold text-sm mt-10 mb-5 ${colors}`}>
          <Icon className="w-4 h-4 shrink-0" />
          <span className="uppercase tracking-wide">{label}</span>
        </div>
      )
    },
    h4: ({ children }) => (
      <h4 className="text-base font-semibold text-[#E6E6F5] mt-6 mb-2 uppercase tracking-wide">{children}</h4>
    ),
    p: ({ children }) => (
      <p className="mb-6 text-base sm:text-lg leading-[1.8] text-[#A5A5C3]">{children}</p>
    ),
    ul: ({ children }) => (
      <ul className="space-y-3 mb-8 pl-1">{children}</ul>
    ),
    ol: ({ children }) => (
      <ol className="list-decimal list-inside space-y-3 mb-8 text-[#A5A5C3] leading-[1.75] text-base sm:text-lg">{children}</ol>
    ),
    li: ({ children }) => (
      <li className="flex items-start gap-2.5 text-[#A5A5C3] text-base sm:text-lg">
        <ChevronRight className="w-4 h-4 mt-[0.3em] text-[#BB86FC] shrink-0" />
        <span className="leading-[1.75]">{children}</span>
      </li>
    ),
    a: ({ href, children }) => (
      <a
        href={href}
        className="text-[#BB86FC] hover:text-[#8686D7] underline underline-offset-4 decoration-[#BB86FC]/30 hover:decoration-[#BB86FC] transition-colors"
        target="_blank"
        rel="noopener noreferrer"
      >
        {children}
      </a>
    ),
    strong: ({ children }) => <strong className="font-bold text-[#E6E6F5]">{children}</strong>,
    em: ({ children }) => <em className="italic text-[#E6E6F5]">{children}</em>,
    code: ({ inline, className, children, ...props }: React.ComponentProps<'code'> & { inline?: boolean } & ExtraProps) => {
      const match = /language-(\w+)/.exec(className || '')
      return !inline && match ? (
        <div className="my-8 rounded-xl overflow-hidden border border-[#3A3A5A] shadow-xl">
          <SyntaxHighlighter
            style={vscDarkPlus}
            language={match[1]}
            PreTag="div"
            customStyle={{
              margin: 0,
              padding: '1.5rem',
              background: '#1e1e2e',
              fontSize: '0.875rem',
            }}
          >
            {String(children).replace(/\n$/, '')}
          </SyntaxHighlighter>
        </div>
      ) : (
        <code className="px-2 py-0.5 rounded-md bg-[#1e1e2e] text-[#BB86FC] font-mono text-sm border border-[#3A3A5A]" {...props}>
          {children}
        </code>
      )
    },
    blockquote: ({ children }) => (
      <blockquote className="my-8 px-6 py-5 border-l-4 border-[#BB86FC] bg-[#BB86FC]/5 rounded-r-xl text-[#A5A5C3] italic">
        {children}
      </blockquote>
    ),
    img: ({ src, alt }) => (
      <div className="my-10 rounded-xl overflow-hidden border border-[#3A3A5A] shadow-xl">
        <img src={src} alt={alt || ''} className="w-full h-auto" loading="lazy" />
        {alt && <p className="text-sm text-[#A5A5C3] text-center py-3 bg-[#1F1F2D]">{alt}</p>}
      </div>
    ),
    table: ({ children }) => (
      <div className="my-10 overflow-x-auto rounded-xl border border-[#3A3A5A] shadow-lg">
        <table className="min-w-full divide-y divide-[#3A3A5A]">{children}</table>
      </div>
    ),
    thead: ({ children }) => <thead className="bg-[#1F1F2D]">{children}</thead>,
    tbody: ({ children }) => <tbody className="divide-y divide-[#3A3A5A] bg-[#252538]">{children}</tbody>,
    th: ({ children }) => (
      <th className="px-6 py-4 text-left text-xs font-semibold text-[#BB86FC] uppercase tracking-widest">
        {children}
      </th>
    ),
    td: ({ children }) => (
      <td className="px-6 py-4 text-sm text-[#A5A5C3]">{children}</td>
    ),
    hr: () => (
      <div className="my-14 flex items-center gap-4">
        <div className="flex-1 h-px bg-[#3A3A5A]" />
        <span className="w-1.5 h-1.5 rounded-full bg-[#BB86FC]" />
        <div className="flex-1 h-px bg-[#3A3A5A]" />
      </div>
    ),
    del: ({ children }) => <del className="text-[#A5A5C3] opacity-60">{children}</del>,
  }

  return (
    <section className="relative min-h-screen w-full overflow-hidden p-2 sm:p-4 md:p-6 lg:p-8 bg-[#09060c]/95">
      <BlogBackground />
      <div className="relative z-10 w-full max-w-6xl mx-auto">
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 mb-6 px-5 py-2.5 rounded-full bg-[#2A2A3F] border border-[#3A3A5A] text-[#E6E6F5] hover:text-[#BB86FC] hover:border-[#BB86FC]/50 font-medium text-sm transition-all duration-300"
        >
          <span className="hover:-translate-x-1 transition-transform">←</span>
          Powrót do bloga
        </Link>

        <article className="bg-[#2A2A3F] rounded-2xl shadow-2xl border border-[#3A3A5A] overflow-hidden">
          <div className="relative w-full h-64 sm:h-80 md:h-96 bg-linear-to-br from-[#3A3A5E] to-[#30304B]">
            <Image src={post.coverImage || DEFAULT_BLOG_IMAGE} alt={post.title} fill className="object-cover" priority />
            <div className="absolute inset-0 bg-linear-to-t from-[#1F1F2D]/80 via-transparent to-transparent" />
          </div>

          <div className="p-5 sm:p-8 md:p-10 lg:p-14">
            <header className="max-w-4xl mx-auto mb-12">
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

            <div className="max-w-4xl mx-auto">
              <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                {post.content}
              </ReactMarkdown>
            </div>

            <div className="max-w-4xl mx-auto mt-16 pt-8 border-t border-[#3A3A5A]">
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
