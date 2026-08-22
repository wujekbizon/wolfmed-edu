import Link from 'next/link'
import { formatDate } from '@/helpers/blogUtils'
import { BlogPost, BlogStatistics } from '@/types/dataTypes'
import { MessageStats } from '@/types/messagesTypes'
import { ForumStats, RecentForumPost } from '@/types/forumPostsTypes'
import AdminStatsGrid from './admin/AdminStatsGrid'
import AdminRecentForumPosts from './admin/AdminRecentForumPosts'

interface AdminBlogPanelProps {
  stats: BlogStatistics
  recentPosts: BlogPost[]
  messageStats: MessageStats
  forumStats: ForumStats
  recentForumPosts: RecentForumPost[]
}

export default function AdminBlogPanel({
  stats,
  recentPosts,
  messageStats,
  forumStats,
  recentForumPosts,
}: AdminBlogPanelProps) {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-zinc-900">Dashboard</h1>
        <p className="text-zinc-600 mt-2">
          Przegląd statystyk i ostatniej aktywności
        </p>
      </div>

      <AdminStatsGrid stats={stats} messageStats={messageStats} forumStats={forumStats} />

      {/* Recent Posts */}
      <div className="bg-white rounded-lg shadow-sm border border-zinc-200">
        <div className="p-6 border-b border-zinc-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-zinc-900">Ostatnie Posty</h2>
            <Link
              href="/admin/posts"
              className="text-sm text-red-600 hover:text-red-700 font-medium"
            >
              Zobacz wszystkie →
            </Link>
          </div>
        </div>

        {recentPosts.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-zinc-500">Brak postów</p>
            <Link
              href="/admin/posts/new"
              className="mt-4 inline-block text-red-600 hover:text-red-700 font-medium"
            >
              Utwórz pierwszy post →
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-zinc-200">
            {recentPosts.map((post) => (
              <div
                key={post.id}
                className="p-6 hover:bg-zinc-50 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          post.status === 'published'
                            ? 'bg-green-100 text-green-800'
                            : post.status === 'draft'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-zinc-100 text-zinc-800'
                        }`}
                      >
                        {post.status === 'published'
                          ? 'Opublikowany'
                          : post.status === 'draft'
                          ? 'Szkic'
                          : 'Zarchiwizowany'}
                      </span>
                      <span className="text-sm text-zinc-500">
                        {formatDate(post.createdAt)}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-zinc-900 truncate">
                      {post.title}
                    </h3>
                    <p className="text-sm text-zinc-600 line-clamp-2 mt-1">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center gap-4 mt-3 text-sm text-zinc-500">
                      <span>👁️ {post.viewCount} wyświetleń</span>
                      {post.readingTime && <span>📖 {post.readingTime} min</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/admin/posts/${post.id}/edit`}
                      className="px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-md transition-colors"
                    >
                      Edytuj
                    </Link>
                    {post.status === 'published' && (
                      <Link
                        href={`/blog/${post.slug}`}
                        className="px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 rounded-md transition-colors"
                        target="_blank"
                      >
                        Zobacz
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <AdminRecentForumPosts posts={recentForumPosts} />

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          href="/admin/posts/new"
          className="bg-red-600 hover:bg-red-700 text-white p-6 rounded-lg shadow-sm transition-colors group"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold">Nowy Post</h3>
              <p className="text-sm text-red-100">Utwórz nowy wpis na blogu</p>
            </div>
          </div>
        </Link>

        <Link
          href="/admin/messages"
          className="bg-emerald-600 hover:bg-emerald-700 text-white p-6 rounded-lg shadow-sm transition-colors group"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-500 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold">Wiadomości</h3>
              <p className="text-sm text-emerald-100">Zarządzaj wiadomościami od użytkowników</p>
            </div>
          </div>
        </Link>

        <Link
          href="/admin/categories"
          className="bg-white hover:bg-zinc-50 text-zinc-900 p-6 rounded-lg shadow-sm border border-zinc-200 transition-colors group"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-zinc-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold">Kategorie i Tagi</h3>
              <p className="text-sm text-zinc-600">Zarządzaj organizacją treści</p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  )
}
