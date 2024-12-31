'use client'

import type { Post } from '@/types/forumPostsTypes'
import ForumPostCard from './ForumPostCard'
import LoadingSpinner from './LoadingSpinner'
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll'

const POSTS_PER_PAGE = 5

type Props = {
  posts: Post[]
  isLoading: boolean
  error: Error | null
}

export default function ForumPostList({ posts, error }: Props) {
  const {
    visibleItems,
    hasMore,
    isLoading: isLoadingMore,
    loadMoreRef,
  } = useInfiniteScroll({
    data: posts,
    itemsPerPage: POSTS_PER_PAGE,
    delay: 500,
  })

  if (error) {
    return <div className="text-center text-red-500 py-8">Wystąpił błąd podczas ładowania postów</div>
  }

  if (posts.length === 0) {
    return <div className="text-center text-zinc-500 py-8">Nie znaleziono żadnych postów</div>
  }

  return (
    <div className="grid gap-6">
      {visibleItems.map((post) => (
        <ForumPostCard key={post.id} post={post} />
      ))}
      {(hasMore || isLoadingMore) && (
        <div ref={loadMoreRef} className="h-10 flex items-center justify-center">
          <LoadingSpinner />
        </div>
      )}
    </div>
  )
}
