'use client'

import Link from 'next/link'
import Image from 'next/image'
import PaginationControls from '@/components/PaginationControls'
import { BlogPost } from '@/types/dataTypes'
import { useBlogSearchStore } from '@/store/useBlogSearch'
import { formatDate } from '@/helpers/formatDate'
import { DEFAULT_BLOG_IMAGE } from '@/constants/blog'

interface BlogPostListProps {
  posts: BlogPost[]
  isLoading: boolean
  error?: Error | null
}

export default function BlogPostList({ posts }: BlogPostListProps) {
  const { currentPage, perPage, setCurrentPage } = useBlogSearchStore()

  const totalPages = Math.ceil(posts?.length / perPage)

  if (currentPage > totalPages && totalPages > 0) {
    setCurrentPage(totalPages)
  }
  const startIndex = (currentPage - 1) * perPage
  const paginatedPosts = posts.slice(startIndex, startIndex + perPage)

  if (!posts?.length) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-12">
        <p className="text-lg text-[#A5A5C3]">Brak dostępnych postów...</p>
      </div>
    )
  }

  return (
    <div className="w-full flex flex-col gap-6">
      {paginatedPosts.map((post: BlogPost) => (
        <article
          key={post.id}
          className="group bg-[#2A2A3F]/40 rounded-2xl shadow-lg border border-[#3A3A5A]/30 hover:border-[#BB86FC]/10 transition-all duration-300 overflow-hidden hover:shadow-lg hover:shadow-[#BB86FC]/5 min-h-[340px]"
        >
          <Link href={`/blog/${post.slug}`} className="flex flex-col sm:flex-row gap-0 sm:gap-6 h-full">
            <div className="relative w-full sm:w-80 h-64 sm:h-auto shrink-0 bg-linear-to-br from-[#3A3A5E]/30 to-[#30304B]/30">
              <Image
                src={post.coverImage || DEFAULT_BLOG_IMAGE}
                alt={post.title}
                fill
                className="object-cover group-hover:scale-102 transition-transform duration-500 opacity-95"
                sizes="(max-width: 640px) 100vw, 288px"
              />
              <div className="absolute inset-0 bg-linear-to-t from-[#1F1F2D]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-[#1F1F2D]/60 backdrop-blur-sm border border-[#BB86FC]/20">
                <span className="text-xs font-medium text-[#dec5fc]/80">Artykuł</span>
              </div>
            </div>

            <div className="flex-1 p-6 sm:p-8 flex flex-col justify-between min-h-[350px]">
              <div className="space-y-3 flex-1">
                <h2 className="text-xl sm:text-2xl font-bold text-[#E6E6F5]/90 group-hover:text-[#BB86FC]/80 transition-colors leading-tight">
                  {post.title}
                </h2>
                <p className="text-sm sm:text-base text-[#A5A5C3]/70 leading-relaxed line-clamp-3">{post.excerpt}</p>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3 mt-4 pt-4 border-t border-[#3A3A5A]/30">
                <div className="flex flex-wrap items-center gap-3">
                  {post.authorName && (
                    <>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-linear-to-br from-[#BB86FC]/20 to-[#8686D7]/20 border border-[#BB86FC]/30 flex items-center justify-center">
                          <span className="text-xs font-semibold text-[#BB86FC]/80">{post.authorName.charAt(0)}</span>
                        </div>
                        <span className="text-sm font-medium text-[#E6E6F5]/80">{post.authorName}</span>
                      </div>
                      <span className="text-[#3A3A5A]/50">•</span>
                    </>
                  )}
                  <time className="text-sm text-[#A5A5C3]/70">
                    {formatDate(post.publishedAt?.toISOString() || post.date || new Date().toISOString())}
                  </time>
                  {post.readingTime && (
                    <>
                      <span className="text-[#3A3A5A]/50">•</span>
                      <span className="text-sm text-[#A5A5C3]/70">{post.readingTime} min czytania</span>
                    </>
                  )}
                  {post.viewCount > 0 && (
                    <>
                      <span className="text-[#3A3A5A]/50">•</span>
                      <span className="text-sm text-[#A5A5C3]/70">{post.viewCount} wyświetleń</span>
                    </>
                  )}
                </div>

                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#BB86FC]/10 hover:bg-[#BB86FC]/20 border border-[#BB86FC]/20 text-[#BB86FC]/80 font-medium text-sm transition-all duration-300">
                  Czytaj więcej
                  <span className="group-hover:translate-x-1 transition-transform duration-300">→</span>
                </div>
              </div>
            </div>
          </Link>
        </article>
      ))}
      {posts.length >= 10 && totalPages > 1 && (
        <PaginationControls totalPages={totalPages} setCurrentPage={setCurrentPage} currentPage={currentPage} />
      )}
    </div>
  )
}
