import { Post } from '@/types/forumPostsTypes'
import PostCard from './PostCard'

export default function PostList({ posts }: { posts: Post[] }) {
  return (
    <div className="grid gap-6">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  )
}
