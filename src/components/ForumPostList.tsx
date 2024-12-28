import type { Post } from '@/types/forumPostsTypes'
import ForumPostCard from './ForumPostCard'

type Props = {
  posts: Post[]
  isLoading?: boolean
  error?: Error | null
}

export default function ForumPostList({ posts, error }: Props) {
  if (error) {
    return <div className="text-center text-red-500 py-8">Wystąpił błąd podczas ładowania postów</div>
  }

  if (posts.length === 0) {
    return <div className="text-center text-zinc-500 py-8">Nie znaleziono żadnych postów</div>
  }

  return (
    <div className="grid gap-6">
      {posts.map((post) => (
        <ForumPostCard key={post.id} post={post} />
      ))}
    </div>
  )
}
