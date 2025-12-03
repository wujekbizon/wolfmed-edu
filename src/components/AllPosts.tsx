'use client'

import { useEffect, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useDebouncedValue } from '@/hooks/useDebounceValue'
import { useBlogSearchStore } from '@/store/useBlogSearch'
import BlogPostList from '@/app/_components/BlogPostList'
import BlogHero from '@/components/BlogHero'
import BlogSearch from '@/components/BlogSearch'
import type { Post } from '@/types/dataTypes'

export default function AllPosts(props: { posts: Post[] }) {
  const { searchTerm, setSearchTerm, currentPage } = useBlogSearchStore()
  const debouncedSearchTerm = useDebouncedValue(searchTerm, 250)

  const listRef = useRef<HTMLDivElement>(null)

  // Scroll to top when the current page changes
  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollIntoView({ behavior: 'instant', block: 'start' })
    }
  }, [currentPage])

  const { data: cachedBlogPosts } = useQuery({
    queryKey: ['allBlogPosts'],
    queryFn: async () => props.posts,
    initialData: props.posts,
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

  return (
    <section className="w-full bg-[#BB86FC]/5">
      <div className="px-3 xs:px-6 lg:px-8 py-4 sm:py-8 md:py-12" ref={listRef}>
        <BlogHero />
        <div className="w-full mb-8">
          <BlogSearch searchTerm={searchTerm} setSearchTerm={setSearchTerm} title="Najnowsze Artykuły" />
        </div>
        <div className="w-full flex flex-col gap-6 p-4 sm:p-8 lg:p-10 rounded-2xl shadow-2xl border border-[#3A3A5A] bg-[#1F1F2D]">
          <BlogPostList posts={filteredBlogPosts ?? cachedBlogPosts} isLoading={searchLoading} error={error} />
        </div>
      </div>
    </section>
  )
}
