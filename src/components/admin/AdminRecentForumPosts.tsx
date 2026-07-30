import Link from 'next/link'
import AdminForumPostRow from './AdminForumPostRow'
import type { RecentForumPost } from '@/types/forumPostsTypes'

export default function AdminRecentForumPosts({
  posts,
}: {
  posts: RecentForumPost[]
}) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-zinc-200">
      <div className="p-6 border-b border-zinc-200 flex items-center justify-between">
        <h2 className="text-xl font-bold text-zinc-900">Ostatnie Posty na Forum</h2>
        <Link
          href="/admin/forum"
          className="text-sm text-red-600 hover:text-red-700 font-medium"
        >
          Zobacz wszystkie →
        </Link>
      </div>

      {posts.length === 0 ? (
        <p className="p-8 text-center text-zinc-500">Brak postów na forum</p>
      ) : (
        <div className="divide-y divide-zinc-200">
          {posts.map((post) => (
            <AdminForumPostRow key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  )
}
