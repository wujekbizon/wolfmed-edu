import { getCurrentUser } from '@/server/user'
import { getLastUserForumPost, getLastUserForumComment } from '@/server/queries'
import Link from 'next/link'
import { MessageSquare } from 'lucide-react'

function formatRelativeDate(date: Date): string {
  const now = new Date()
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000)
  if (diff < 60) return 'przed chwilą'
  if (diff < 3600) return `${Math.floor(diff / 60)} min temu`
  if (diff < 86400) return `${Math.floor(diff / 3600)} godz. temu`
  return `${Math.floor(diff / 86400)} dni temu`
}

export default async function ForumActivityCard() {
  const user = await getCurrentUser()
  if (!user) return null

  const [lastPost, lastComment] = await Promise.all([
    getLastUserForumPost(user.userId),
    getLastUserForumComment(user.userId),
  ])

  const hasActivity = lastPost || lastComment

  if (!hasActivity) {
    return (
      <div className="rounded-2xl p-5 border border-white/60 bg-white/70 backdrop-blur-sm">
        <div className="flex items-center gap-2 mb-2">
          <MessageSquare className="w-4 h-4 text-zinc-400" />
          <h3 className="text-base font-semibold text-zinc-800">Forum</h3>
        </div>
        <p className="text-sm text-zinc-500 mb-3">
          Nie masz jeszcze żadnych postów na forum.
        </p>
        <Link
          href="/forum"
          className="text-xs font-semibold text-rose-500 hover:text-rose-600 transition-colors"
        >
          Dołącz do dyskusji →
        </Link>
      </div>
    )
  }

  const mostRecent =
    lastPost && lastComment
      ? lastPost.createdAt > lastComment.createdAt
        ? { type: 'post' as const, data: lastPost }
        : { type: 'comment' as const, data: lastComment }
      : lastPost
        ? { type: 'post' as const, data: lastPost }
        : { type: 'comment' as const, data: lastComment! }

  return (
    <div className="rounded-2xl p-5 border border-white/60 bg-white/70 backdrop-blur-sm">
      <div className="flex items-center gap-2 mb-3">
        <MessageSquare className="w-4 h-4 text-zinc-400" />
        <h3 className="text-base font-semibold text-zinc-800">Forum</h3>
      </div>
      <div className="bg-white/50 border border-white/50 rounded-xl px-4 py-3">
        <p className="text-xs text-zinc-500 mb-1">
          {mostRecent.type === 'post' ? 'Twój post' : 'Twój komentarz'} ·{' '}
          {formatRelativeDate(mostRecent.data.createdAt)}
        </p>
        <p className="text-sm text-zinc-700 line-clamp-2">
          {mostRecent.type === 'post'
            ? (mostRecent.data as NonNullable<typeof lastPost>).title
            : (mostRecent.data as NonNullable<typeof lastComment>).content}
        </p>
      </div>
      <Link
        href={
          mostRecent.type === 'post'
            ? `/forum/${(mostRecent.data as NonNullable<typeof lastPost>).id}`
            : `/forum/${(mostRecent.data as NonNullable<typeof lastComment>).postId}`
        }
        className="inline-block mt-3 text-xs font-semibold text-rose-500 hover:text-rose-600 transition-colors"
      >
        Zobacz →
      </Link>
    </div>
  )
}
