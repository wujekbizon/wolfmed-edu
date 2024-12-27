'use client'

import { useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useDebouncedValue } from '@/hooks/useDebounceValue'
import PostList from '@/app/_components/PostList'
import type { Post } from '@/types/forumPostsTypes'
import { useForumSearchStore } from '@/store/useForumSearch'
import CreatePostButton from './CreatePostButton'
import SearchIcon from './icons/SearchIcon'

export default function AllForumPosts(props: { posts: Post[] }) {
  const { searchTerm, setSearchTerm } = useForumSearchStore()
  const debouncedSearchTerm = useDebouncedValue(searchTerm, 250)
  const listRef = useRef<HTMLDivElement>(null)

  const { data: cachedForumPosts } = useQuery({
    queryKey: ['allForumPosts'],
    queryFn: async () => props.posts,
    initialData: props.posts,
    staleTime: 10 * 60 * 1000,
  })

  const filteredForumPostsQueryFn = async () => {
    if (!debouncedSearchTerm) return cachedForumPosts

    return cachedForumPosts.filter((post) => {
      const matchTitle = post.title.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
      const matchContent = post.content.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
      const matchAuthor = post.authorName.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
      return matchTitle || matchContent || matchAuthor
    })
  }

  const {
    data: filteredForumPosts,
    isLoading: searchLoading,
    error,
  } = useQuery({
    queryKey: ['filteredForumPosts', debouncedSearchTerm],
    queryFn: filteredForumPostsQueryFn,
    enabled: !!searchTerm || true,
    staleTime: 10 * 60 * 1000,
  })

  return (
    <section className="min-h-screen w-full max-w-7xl mx-auto px-0 xs:px-4 py-0 xs:py-8">
      <div className="bg-zinc-900 rounded-lg overflow-hidden">
        <div className="p-4 xs:p-6 border-b border-zinc-800">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl xs:text-5xl py-1 font-bold bg-gradient-to-r from-red-200 to-red-500 bg-clip-text text-transparent">
                Forum dyskusyjne
              </h1>
              <p className="text-zinc-200 text-base font-light">
                Dołącz do dyskusji i dziel się swoimi doświadczeniami
              </p>
            </div>
            <CreatePostButton />
          </div>
        </div>
        <div className="px-4 xs:px-6 py-3 bg-zinc-800/50">
          <div className="relative w-full md:max-w-md">
            <div className="relative">
              <label htmlFor="forum-search">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
              </label>
              <input
                id="forum-search"
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Szukaj na forum..."
                className="w-full pl-10 pr-4 py-2 bg-zinc-700/50 rounded-lg text-zinc-100 text-sm 
                placeholder:text-zinc-500 outline-none focus:ring-1 focus:ring-zinc-300/20"
              />
            </div>
          </div>
        </div>
      </div>
      <div className="mt-6" ref={listRef}>
        <PostList posts={filteredForumPosts ?? cachedForumPosts} isLoading={searchLoading} error={error} />
      </div>
    </section>
  )
}
