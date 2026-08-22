import { FileText, Eye, Heart, Mail, MessagesSquare } from 'lucide-react'
import AdminStatCard from './AdminStatCard'
import type { BlogStatistics } from '@/types/dataTypes'
import type { ForumStats } from '@/types/forumPostsTypes'
import type { MessageStats } from '@/types/messagesTypes'

export default function AdminStatsGrid({
  stats,
  messageStats,
  forumStats,
}: {
  stats: BlogStatistics
  messageStats: MessageStats
  forumStats: ForumStats
}) {
  const averageViews =
    stats.publishedPosts > 0
      ? Math.round(stats.totalViews / stats.publishedPosts)
      : 0
  const averageLikes =
    stats.publishedPosts > 0
      ? (stats.totalLikes / stats.publishedPosts).toFixed(1)
      : 0

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
      <AdminStatCard
        label="Wszystkie Posty"
        value={stats.totalPosts}
        accent="bg-red-100"
        icon={<FileText className="w-6 h-6 text-red-600" />}
        footer={
          <div className="flex items-center gap-4">
            <span className="text-green-600">{stats.publishedPosts} opublikowane</span>
            <span className="text-yellow-600">{stats.draftPosts} szkice</span>
          </div>
        }
      />

      <AdminStatCard
        label="Wyświetlenia"
        value={stats.totalViews.toLocaleString('pl-PL')}
        accent="bg-blue-100"
        icon={<Eye className="w-6 h-6 text-blue-600" />}
        footer={<span className="text-zinc-600">{averageViews} średnio na post</span>}
      />

      <AdminStatCard
        label="Polubienia"
        value={stats.totalLikes}
        accent="bg-pink-100"
        icon={<Heart className="w-6 h-6 text-pink-600" />}
        footer={<span className="text-zinc-600">{averageLikes} średnio na post</span>}
      />

      <AdminStatCard
        label="Wiadomości"
        value={messageStats.total}
        accent="bg-emerald-100"
        icon={<Mail className="w-6 h-6 text-emerald-600" />}
        footer={
          <div className="flex items-center gap-4">
            <span className="text-emerald-600">{messageStats.unread} nieprzeczytane</span>
            <span className="text-blue-600">{messageStats.thisWeek} w tym tyg.</span>
          </div>
        }
      />

      <AdminStatCard
        label="Forum"
        value={forumStats.total}
        accent="bg-violet-100"
        icon={<MessagesSquare className="w-6 h-6 text-violet-600" />}
        footer={
          <div className="flex items-center gap-4">
            <span className="text-violet-600">{forumStats.thisWeek} w tym tyg.</span>
            <span className="text-amber-600">{forumStats.unanswered} bez odpowiedzi</span>
          </div>
        }
      />
    </div>
  )
}
