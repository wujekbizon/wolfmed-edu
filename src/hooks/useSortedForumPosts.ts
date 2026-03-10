import { useMemo } from 'react'
import { useForumSearchStore } from '@/store/useForumSearch'
import { Post } from '@/types/forumPostsTypes'

export function useSortedForumPosts(posts: Post[]): Post[] {
  const { sortOption } = useForumSearchStore()

  return useMemo(() => {
    switch (sortOption) {
      case 'newest':
        return [...posts]
          .map((p) => ({ p, t: new Date(p.createdAt).getTime() }))
          .sort((a, b) => b.t - a.t)
          .map(({ p }) => p)
      case 'oldest':
        return [...posts]
          .map((p) => ({ p, t: new Date(p.createdAt).getTime() }))
          .sort((a, b) => a.t - b.t)
          .map(({ p }) => p)
      case 'most_comments':
        return [...posts].sort((a, b) => b.comments.length - a.comments.length)
      case 'recent_activity':
        return [...posts]
          .map((p) => ({
            p,
            t: p.comments.reduce(
              (max, c) => Math.max(max, new Date(c.createdAt).getTime()),
              new Date(p.createdAt).getTime(),
            ),
          }))
          .sort((a, b) => b.t - a.t)
          .map(({ p }) => p)
      default:
        return posts
    }
  }, [posts, sortOption])
}
