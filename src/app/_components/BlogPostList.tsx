'use client'

import { useEffect, useRef } from 'react'
import { useDebouncedValue } from '@/hooks/useDebounceValue'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { useSearchTermStore } from '@/store/useSearchTermStore'
import SearchTerm from '@/components/SearchTerm'
import PaginationControls from '@/components/PaginationControls'
import { blogPosts } from '@/data/blogPosts'
import { BlogPostType } from '@/types/blogTypes'

const POSTS_PER_PAGE = 5

export default function BlogPostList() {
  const { searchTerm, currentPage } = useSearchTermStore()
  const debouncedSearchTerm = useDebouncedValue(searchTerm, 250)
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTo({ top: 0, behavior: 'instant' })
    }
  }, [currentPage])

  const { data: cachedBlogPosts } = useQuery({
    queryKey: ['allBlogPosts'],
    queryFn: async () => blogPosts,
    initialData: blogPosts,
    staleTime: 10 * 60 * 1000, // Cache for 10 minutes
  })

  const filteredBlogPostsQueryFn = async () => {
    if (!debouncedSearchTerm) return cachedBlogPosts

    return cachedBlogPosts.filter((post) => {
      const matchTitle = post.title.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
      const matchExcerpt = post.excerpt.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
      const matchContent = post.content.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
      return matchTitle || matchExcerpt || matchContent
    })
  }

  const {
    data: filteredBlogPosts,
    isLoading: searchLoading,
    error,
  } = useQuery({
    queryKey: ['filteredBlogPosts', debouncedSearchTerm],
    queryFn: filteredBlogPostsQueryFn,
    enabled: !!searchTerm || true,
    staleTime: 10 * 60 * 1000,
  })

  const paginatedPosts = (filteredBlogPosts ?? cachedBlogPosts).slice(
    (currentPage - 1) * POSTS_PER_PAGE,
    currentPage * POSTS_PER_PAGE
  )

  const totalPages = Math.ceil((filteredBlogPosts ?? cachedBlogPosts).length / POSTS_PER_PAGE)

  return (
    <div className="w-full lg:w-2/3 xl:w-1/2 flex flex-col items-center gap-8" ref={listRef}>
      <SearchTerm label="Szukaj postu" />
      {searchLoading ? (
        <p>Loading...</p>
      ) : error ? (
        <p>Error: {(error as Error).message}</p>
      ) : (
        <>
          <div className="w-full grid gap-8">
            {paginatedPosts.map((post: BlogPostType) => (
              <Link key={post.id} href={`/blog/${post.id}`}>
                <div className="bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition-shadow border border-red-200/40">
                  <h2 className="text-2xl font-semibold text-zinc-900 mb-2">{post.title}</h2>
                  <p className="text-zinc-600 mb-4">{post.excerpt}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-zinc-500">{post.date}</span>
                    <span className="text-sm font-medium text-[#ff5b5b]">Czytaj więcej →</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          <PaginationControls totalPages={totalPages} />
        </>
      )}
    </div>
  )
}
