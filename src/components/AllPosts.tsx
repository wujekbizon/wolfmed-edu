'use client'

import { useEffect, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useDebouncedValue } from '@/hooks/useDebounceValue'
import { useBlogSearchStore } from '@/store/useBlogSearch'
import BlogPostList from '@/app/_components/BlogPostList'
import BlogHero from '@/components/BlogHero'
import SearchTerm from '@/components/SearchTerm'
import type { Post } from '@/types/dataTypes'

export default function AllPosts(props: { posts: Post[] }) {
  const { searchTerm, setSearchTerm, isExpanded, toggleExpand, currentPage } = useBlogSearchStore()
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
    <section className="w-full rounded-br-3xl sm:rounded-br-[50px] rounded-bl-3xl sm:rounded-bl-[50px]">
      <div className="max-w-7xl mx-auto px-0 xs:px-6 lg:px-8 py-0 xs:py-4 sm:py-8 md:py-12" ref={listRef}>
        <BlogHero />
        <div className="min-h-screen flex flex-col items-center w-full bg-zinc-50 rounded-br-3xl rounded-bl-3xl rounded-none xs:rounded-3xl p-4 sm:p-8">
          <div className="w-full md:w-[85%] lg:w-3/4 xl:w-2/3 2xl:w-[60%] pb-4">
            <SearchTerm
              label="Szukaj postu"
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              isExpanded={isExpanded}
              toggleExpand={toggleExpand}
              title="Najnowsze Artykuły"
            />
          </div>
          <BlogPostList posts={filteredBlogPosts ?? cachedBlogPosts} isLoading={searchLoading} error={error} />
        </div>
      </div>
    </section>
  )
}
