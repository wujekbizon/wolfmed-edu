import { MessagesSquare, MessageCircle, Clock, CalendarDays } from 'lucide-react'
import AdminStatCard from './AdminStatCard'
import type { ForumStats } from '@/types/forumPostsTypes'

export default function AdminForumStats({ stats }: { stats: ForumStats }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <AdminStatCard
        label="Wszystkie Posty"
        value={stats.total}
        accent="bg-violet-100"
        icon={<MessagesSquare className="w-6 h-6 text-violet-600" />}
        footer={<span className="text-zinc-600">{stats.thisMonth} w tym miesiącu</span>}
      />
      <AdminStatCard
        label="Komentarze"
        value={stats.totalComments}
        accent="bg-blue-100"
        icon={<MessageCircle className="w-6 h-6 text-blue-600" />}
        footer={<span className="text-zinc-600">łącznie w dyskusjach</span>}
      />
      <AdminStatCard
        label="Bez odpowiedzi"
        value={stats.unanswered}
        accent="bg-amber-100"
        icon={<Clock className="w-6 h-6 text-amber-600" />}
        footer={<span className="text-amber-600">czeka na reakcję</span>}
      />
      <AdminStatCard
        label="W tym tygodniu"
        value={stats.thisWeek}
        accent="bg-emerald-100"
        icon={<CalendarDays className="w-6 h-6 text-emerald-600" />}
        footer={<span className="text-zinc-600">nowych postów</span>}
      />
    </div>
  )
}
