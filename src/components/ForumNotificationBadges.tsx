import Link from 'next/link'
import { Megaphone, MessageCircle, Sparkles } from 'lucide-react'
import { FORUM_NOTIFICATION_BADGE_CAP } from '@/constants/forumNotifications'
import type { ForumNotifications } from '@/types/forumPostsTypes'

function formatCount(value: number): string {
  return value > FORUM_NOTIFICATION_BADGE_CAP
    ? `${FORUM_NOTIFICATION_BADGE_CAP}+`
    : String(value)
}

export default function ForumNotificationBadges({
  notifications,
}: {
  notifications: ForumNotifications
}) {
  const { newPosts, newAdminPosts, newComments } = notifications
  const otherPosts = newPosts - newAdminPosts

  if (newPosts === 0 && newComments === 0) return null

  return (
    <div className="flex flex-wrap gap-2 mb-3">
      {newAdminPosts > 0 && (
        <Link
          href="/forum"
          className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/10 border border-rose-200 px-2.5 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-500/15 transition-colors"
        >
          <Megaphone className="w-3.5 h-3.5" />
          {formatCount(newAdminPosts)} od zespołu
        </Link>
      )}
      {otherPosts > 0 && (
        <Link
          href="/forum"
          className="inline-flex items-center gap-1.5 rounded-full bg-zinc-900/5 border border-zinc-200 px-2.5 py-1 text-xs font-semibold text-zinc-700 hover:bg-zinc-900/10 transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5" />
          {formatCount(otherPosts)} nowych postów
        </Link>
      )}
      {newComments > 0 && (
        <Link
          href="/forum"
          className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-200 px-2.5 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-500/15 transition-colors"
        >
          <MessageCircle className="w-3.5 h-3.5" />
          {formatCount(newComments)} odpowiedzi na Twoje posty
        </Link>
      )}
    </div>
  )
}
