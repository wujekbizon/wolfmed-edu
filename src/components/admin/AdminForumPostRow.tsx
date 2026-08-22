import Link from 'next/link'
import { MessageCircle } from 'lucide-react'
import { formatRelativeDate } from '@/helpers/formatRelativeDate'
import type { RecentForumPost } from '@/types/forumPostsTypes'

export default function AdminForumPostRow({ post }: { post: RecentForumPost }) {
  return (
    <Link
      href={`/forum/${post.id}`}
      className="flex items-start justify-between gap-4 p-6 hover:bg-zinc-50 transition-colors"
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-sm font-medium text-zinc-700">{post.authorName}</span>
          {post.authorRole === 'admin' && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
              Admin
            </span>
          )}
          <span className="text-sm text-zinc-500">
            {formatRelativeDate(post.createdAt)}
          </span>
        </div>
        <h3 className="text-lg font-semibold text-zinc-900 truncate">{post.title}</h3>
      </div>
      <span className="flex items-center gap-1.5 shrink-0 text-sm text-zinc-500">
        <MessageCircle className="w-4 h-4" />
        {post.commentCount}
      </span>
    </Link>
  )
}
