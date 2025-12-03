'use client'

import { useEffect, useRef, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useDebouncedValue } from '@/hooks/useDebounceValue'
import { useBlogSearchStore } from '@/store/useBlogSearch'
import BlogPostList from '@/app/_components/BlogPostList'
import BlogHero from '@/components/BlogHero'
import BlogSearch from '@/components/BlogSearch'
import BlogSort from '@/components/BlogSort'
import type { BlogPost } from '@/types/dataTypes'

export default function AllPosts(props: { posts: BlogPost[] }) {
  const { searchTerm, setSearchTerm, currentPage, sortBy } = useBlogSearchStore()
  const debouncedSearchTerm = useDebouncedValue(searchTerm, 250)

  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollIntoView({ behavior: 'instant', block: 'start' })
    }
  }, [currentPage])

  const { data: cachedBlogPosts } = useQuery({
    queryKey: ['allBlogPosts'],
    queryFn: async () => props.posts,
    initialData: props.posts,
    staleTime: 10 * 60 * 1000,
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

  const sortedPosts = useMemo(() => {
    const posts = filteredBlogPosts ?? cachedBlogPosts
    switch (sortBy) {
      case 'oldest':
        return [...posts].sort((a, b) => {
          const dateA = new Date(a.publishedAt || a.createdAt).getTime()
          const dateB = new Date(b.publishedAt || b.createdAt).getTime()
          return dateA - dateB
        })
      case 'popular':
        return [...posts].sort((a, b) => b.viewCount - a.viewCount)
      case 'newest':
      default:
        return [...posts].sort((a, b) => {
          const dateA = new Date(a.publishedAt || a.createdAt).getTime()
          const dateB = new Date(b.publishedAt || b.createdAt).getTime()
          return dateB - dateA
        })
    }
  }, [filteredBlogPosts, cachedBlogPosts, sortBy])

  return (
    <section className="w-full bg-[#09060c]/95">
      <div className="px-3 xs:px-6 lg:px-8 py-4 sm:py-8 md:py-12" ref={listRef}>
        <BlogHero />
        <div className="h-32 relative w-full mb-8 flex items-center justify-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full h-px bg-linear-to-r from-transparent via-[#3A3A5A]/50 to-transparent" />
          </div>
          <div className="relative flex items-center justify-center px-4">
            <div className="bg-linear-to-r from-[#2A2A3F] via-[#3A3A5E] to-[#2A2A3F] p-3 rounded-full border border-[#3A3A5A]/50 shadow-lg shadow-[#BB86FC]/5">
              <svg
                className="w-5 h-5 text-[#BB86FC]/80"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
            </div>
          </div>
        </div>
        <div className="w-full mb-8 flex flex-col sm:flex-row sm:gap-8 gap-4 justify-between items-center">
          <div className="flex w-full">
            <BlogSearch searchTerm={searchTerm} setSearchTerm={setSearchTerm} title="Najnowsze Artykuły" />
          </div>
          <BlogSort />
        </div>
        <div className="w-full flex flex-col gap-6 p-4 sm:p-8 lg:p-10 rounded-xl border border-[#3A3A5A]/50 bg-[#1F1F2D]">
          <BlogPostList posts={sortedPosts} isLoading={searchLoading} error={error} />
        </div>
      </div>
    </section>
  )
}
