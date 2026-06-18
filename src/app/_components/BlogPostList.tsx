'use client'

import PaginationControls from '@/components/PaginationControls'
import { BlogPost } from '@/types/dataTypes'
import { useBlogSearchStore } from '@/store/useBlogSearch'
import BlogPostCard from '@/app/_components/BlogPostCard'

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
        <BlogPostCard key={post.id} post={post} />
      ))}
      {posts.length >= 10 && totalPages > 1 && (
        <PaginationControls totalPages={totalPages} setCurrentPage={setCurrentPage} currentPage={currentPage} />
      )}
    </div>
  )
}
