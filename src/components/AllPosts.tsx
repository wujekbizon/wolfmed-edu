'use client'

import { useEffect, useRef, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useDebouncedValue } from '@/hooks/useDebounceValue'
import { useBlogSearchStore } from '@/store/useBlogSearch'
import BlogPostList from '@/app/_components/BlogPostList'
import type { BlogPost } from '@/types/dataTypes'

export default function AllPosts(props: { posts: BlogPost[] }) {
  const { searchTerm, currentPage, sortBy } = useBlogSearchStore()
  const debouncedSearchTerm = useDebouncedValue(searchTerm, 250)

  const listRef = useRef<HTMLDivElement>(null)
  const previousPageRef = useRef(currentPage)

  useEffect(() => {
    if (previousPageRef.current === currentPage) return

    previousPageRef.current = currentPage
    listRef.current?.scrollIntoView({ behavior: 'instant', block: 'start' })
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
    <div ref={listRef}>
      <BlogPostList posts={sortedPosts} isLoading={searchLoading} error={error} />
    </div>
  )
}
