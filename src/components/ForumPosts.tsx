'use client'

import { useDebouncedValue } from '@/hooks/useDebounceValue'
import type { Post } from '@/types/forumPostsTypes'
import { useForumSearchStore } from '@/store/useForumSearch'
import { useSortedForumPosts } from '@/hooks/useSortedForumPosts'
import ForumPostList from '@/components/ForumPostList'

export default function ForumPosts(props: { posts: Post[] }) {
  const { searchTerm } = useForumSearchStore()
  const debouncedSearchTerm = useDebouncedValue(searchTerm, 250)

  const filteredPosts = debouncedSearchTerm
    ? props.posts.filter((post) => {
        const matchTitle = post.title.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
        const matchContent = post.content.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
        const matchAuthor = post.authorName.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
        return matchTitle || matchContent || matchAuthor
      })
    : props.posts

  const sortedPosts = useSortedForumPosts(filteredPosts)

  return <ForumPostList posts={sortedPosts} isLoading={false} error={null} />
}
