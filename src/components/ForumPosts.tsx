'use client'

import { useRef } from 'react'
import { useDebouncedValue } from '@/hooks/useDebounceValue'
import type { Post } from '@/types/forumPostsTypes'
import { useForumSearchStore } from '@/store/useForumSearch'
import { useSortedForumPosts } from '@/hooks/useSortedForumPosts'
import ForumPostList from '@/components/ForumPostList'
import ForumHeader from './ForumHeader'
import ForumSearch from './ForumSearch'
import ForumSort from './ForumSort'

export default function ForumPosts(props: { posts: Post[] }) {
  const { searchTerm, setSearchTerm, sortOption, setSortOption } = useForumSearchStore()
  const debouncedSearchTerm = useDebouncedValue(searchTerm, 250)
  const listRef = useRef<HTMLDivElement>(null)

  // Filter posts based on search term
  const filteredPosts = debouncedSearchTerm
    ? props.posts.filter((post) => {
        const matchTitle = post.title.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
        const matchContent = post.content.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
        const matchAuthor = post.authorName.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
        return matchTitle || matchContent || matchAuthor
      })
    : props.posts

  // Apply sorting to filtered posts
  const sortedPosts = useSortedForumPosts(filteredPosts)

  return (
    <section className="min-h-screen w-full max-w-7xl mx-auto px-0 xs:px-4 py-0 xs:py-8">
      <div className="bg-zinc-900 rounded-lg overflow-hidden">
        <ForumHeader />
        <div className="px-4 xs:px-6 py-3 bg-zinc-800/50">
          <div className="flex flex-col md:flex-row md:items-center gap-3 justify-between">
            <ForumSearch searchTerm={searchTerm} onSearch={setSearchTerm} />
            <ForumSort sortOption={sortOption} onSort={setSortOption} />
          </div>
        </div>
      </div>
      <div className="mt-6" ref={listRef}>
        <ForumPostList posts={sortedPosts} isLoading={false} error={null} />
      </div>
    </section>
  )
}
