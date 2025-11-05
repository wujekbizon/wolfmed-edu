import Link from 'next/link'
import { getBlogStatistics, getAllBlogPosts } from '@/server/queries/blogQueries'
import { formatDate } from '@/lib/blogUtils'

export default async function AdminDashboardPage() {
  const stats = await getBlogStatistics()
  const recentPosts = await getAllBlogPosts({
    status: undefined, // Get all statuses
    limit: 5,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  })

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-zinc-900">Dashboard</h1>
        <p className="text-zinc-600 mt-2">
          Przegląd statystyk i ostatniej aktywności
        </p>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Posts */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-zinc-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-600 font-medium">Wszystkie Posty</p>
              <p className="text-3xl font-bold text-zinc-900 mt-2">
                {stats.totalPosts}
              </p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-4 text-sm">
            <span className="text-green-600">{stats.publishedPosts} opublikowane</span>
            <span className="text-yellow-600">{stats.draftPosts} szkice</span>
          </div>
        </div>

        {/* Total Views */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-zinc-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-600 font-medium">Wyświetlenia</p>
              <p className="text-3xl font-bold text-zinc-900 mt-2">
                {stats.totalViews.toLocaleString('pl-PL')}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
          </div>
          <p className="mt-4 text-sm text-zinc-600">
            {stats.publishedPosts > 0
              ? Math.round(stats.totalViews / stats.publishedPosts)
              : 0}{' '}
            średnio na post
          </p>
        </div>

        {/* Total Likes */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-zinc-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-600 font-medium">Polubienia</p>
              <p className="text-3xl font-bold text-zinc-900 mt-2">
                {stats.totalLikes}
              </p>
            </div>
            <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-pink-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
            </div>
          </div>
          <p className="mt-4 text-sm text-zinc-600">
            {stats.publishedPosts > 0
              ? (stats.totalLikes / stats.publishedPosts).toFixed(1)
              : 0}{' '}
            średnio na post
          </p>
        </div>

        {/* Categories & Tags */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-zinc-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-600 font-medium">Organizacja</p>
              <p className="text-3xl font-bold text-zinc-900 mt-2">
                {stats.totalCategories + stats.totalTags}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-4 text-sm">
            <span className="text-purple-600">{stats.totalCategories} kategorie</span>
            <span className="text-indigo-600">{stats.totalTags} tagi</span>
          </div>
        </div>
      </div>

      {/* Recent Posts */}
      <div className="bg-white rounded-lg shadow-sm border border-zinc-200">
        <div className="p-6 border-b border-zinc-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-zinc-900">Ostatnie Posty</h2>
            <Link
              href="/blog/admin/posts"
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
              href="/blog/admin/posts/new"
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
                      href={`/blog/admin/posts/${post.id}/edit`}
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

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          href="/blog/admin/posts/new"
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
          href="/blog/admin/posts"
          className="bg-white hover:bg-zinc-50 text-zinc-900 p-6 rounded-lg shadow-sm border border-zinc-200 transition-colors group"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-zinc-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold">Zarządzaj Postami</h3>
              <p className="text-sm text-zinc-600">Zobacz i edytuj wszystkie posty</p>
            </div>
          </div>
        </Link>

        <Link
          href="/blog/admin/categories"
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
