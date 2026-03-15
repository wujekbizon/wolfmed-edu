import { auth } from '@clerk/nextjs/server'
import { db } from '@/server/db'
import { forumPosts, forumComments } from '@/server/db/schema'
import { eq, desc } from 'drizzle-orm'
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
  const { userId } = await auth()
  if (!userId) return null

  const [lastPost] = await db
    .select({ id: forumPosts.id, title: forumPosts.title, createdAt: forumPosts.createdAt })
    .from(forumPosts)
    .where(eq(forumPosts.authorId, userId))
    .orderBy(desc(forumPosts.createdAt))
    .limit(1)

  const [lastComment] = await db
    .select({
      id: forumComments.id,
      content: forumComments.content,
      createdAt: forumComments.createdAt,
      postId: forumComments.postId,
    })
    .from(forumComments)
    .where(eq(forumComments.authorId, userId))
    .orderBy(desc(forumComments.createdAt))
    .limit(1)

  const hasActivity = lastPost || lastComment

  if (!hasActivity) {
    return (
      <div className="rounded-2xl p-5 border border-zinc-200/50 bg-white shadow-sm">
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
    <div className="rounded-2xl p-5 border border-zinc-200/50 bg-white shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <MessageSquare className="w-4 h-4 text-zinc-400" />
        <h3 className="text-base font-semibold text-zinc-800">Forum</h3>
      </div>
      <div className="bg-zinc-50/80 border border-zinc-200/50 rounded-xl px-4 py-3">
        <p className="text-xs text-zinc-500 mb-1">
          {mostRecent.type === 'post' ? 'Twój post' : 'Twój komentarz'} ·{' '}
          {formatRelativeDate(mostRecent.data.createdAt)}
        </p>
        <p className="text-sm text-zinc-700 line-clamp-2">
          {mostRecent.type === 'post'
            ? (mostRecent.data as typeof lastPost).title
            : (mostRecent.data as typeof lastComment).content}
        </p>
      </div>
      <Link
        href={
          mostRecent.type === 'post'
            ? `/forum/${(mostRecent.data as typeof lastPost).id}`
            : `/forum/${(mostRecent.data as typeof lastComment).postId}`
        }
        className="inline-block mt-3 text-xs font-semibold text-rose-500 hover:text-rose-600 transition-colors"
      >
        Zobacz →
      </Link>
    </div>
  )
}
