import { useForumSearchStore } from '@/store/useForumSearch'
import { Post } from '@/types/forumPostsTypes'

export function useSortedForumPosts(posts: Post[]): Post[] {
  const { sortOption } = useForumSearchStore()

  switch (sortOption) {
    case 'newest':
      return [...posts].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    case 'oldest':
      return [...posts].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    case 'most_comments':
      return [...posts].sort((a, b) => b.comments.length - a.comments.length)
    case 'recent_activity':
      return [...posts].sort((a, b) => {
        const aLastActivity =
          a.comments.length > 0
            ? Math.max(...a.comments.map((c) => new Date(c.createdAt).getTime()), new Date(a.createdAt).getTime())
            : new Date(a.createdAt).getTime()
        const bLastActivity =
          b.comments.length > 0
            ? Math.max(...b.comments.map((c) => new Date(c.createdAt).getTime()), new Date(b.createdAt).getTime())
            : new Date(b.createdAt).getTime()
        return bLastActivity - aLastActivity
      })
    default:
      return posts
  }
}
