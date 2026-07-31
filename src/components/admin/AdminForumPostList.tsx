import Link from 'next/link'
import AdminForumPostRow from './AdminForumPostRow'
import type { RecentForumPost } from '@/types/forumPostsTypes'

export default function AdminForumPostList({
  posts,
  page,
  totalPages,
}: {
  posts: RecentForumPost[]
  page: number
  totalPages: number
}) {
  if (posts.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-zinc-200 p-8 text-center">
        <p className="text-zinc-500">Brak postów na forum</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-zinc-200">
      <div className="divide-y divide-zinc-200">
        {posts.map((post) => (
          <AdminForumPostRow key={post.id} post={post} />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between p-6 border-t border-zinc-200">
          {page > 1 ? (
            <Link
              href={`/admin/forum?page=${page - 1}`}
              className="text-sm font-medium text-red-600 hover:text-red-700"
            >
              ← Poprzednia
            </Link>
          ) : (
            <span />
          )}
          <span className="text-sm text-zinc-500">
            Strona {page} z {totalPages}
          </span>
          {page < totalPages ? (
            <Link
              href={`/admin/forum?page=${page + 1}`}
              className="text-sm font-medium text-red-600 hover:text-red-700"
            >
              Następna →
            </Link>
          ) : (
            <span />
          )}
        </div>
      )}
    </div>
  )
}
