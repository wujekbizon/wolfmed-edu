'use client'

import Link from 'next/link'
import PaginationControls from '@/components/PaginationControls'
import { Post } from '@/types/dataTypes'
import { useBlogSearchStore } from '@/store/useBlogSearch'

interface BlogPostListProps {
  posts: Post[]
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
      <div className="flex flex-col items-center justify-center gap-4">
        <p className="text-lg text-muted-foreground">Brak dostępnych postów...</p>
      </div>
    )
  }

  return (
    <div className="w-full md:w-[85%] lg:w-3/4 xl:w-2/3 2xl:w-[60%] flex flex-col gap-6 pb-2 pr-1 overflow-y-auto">
      {paginatedPosts.map((post: Post) => (
        <Link key={post.id} href={`/blog/${post.slug}`}>
          <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-md hover:shadow-lg transition-shadow border border-red-200/40">
            <h2 className="text-2xl font-semibold text-zinc-900 mb-2">{post.title}</h2>
            <p className="text-zinc-600 mb-4">{post.excerpt}</p>
            <div className="flex justify-between items-center">
              <span className="text-sm text-zinc-500">{post.date}</span>
              <span className="text-sm font-medium text-[#ff5b5b]">Czytaj więcej →</span>
            </div>
          </div>
        </Link>
      ))}
      <PaginationControls totalPages={totalPages} setCurrentPage={setCurrentPage} currentPage={currentPage} />
    </div>
  )
}
