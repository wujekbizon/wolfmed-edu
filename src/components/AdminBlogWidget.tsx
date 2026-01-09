import Link from 'next/link'
import { isUserAdmin } from '@/lib/adminHelpers'
import { getBlogStatistics } from '@/server/queries'

export default async function AdminBlogWidget() {
  // Check if user is admin
  const isAdmin = await isUserAdmin()

  // Don't render anything if not admin
  if (!isAdmin) {
    return null
  }

  // Get blog statistics
  const stats = await getBlogStatistics()

  return (
    <div className="bg-gradient-to-br from-red-50/80 via-white/60 to-red-50/80 backdrop-blur-sm p-4 sm:p-6 rounded-xl shadow-md border border-red-200/60 hover:shadow-lg transition-all duration-300">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-zinc-900 mb-1">
            Zarządzanie Blogiem
          </h3>
          <p className="text-sm text-zinc-600">Panel administracyjny</p>
        </div>
        <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
          <svg
            className="w-6 h-6 text-red-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-white/80 p-3 rounded-lg">
          <p className="text-xs text-zinc-600 mb-1">Posty</p>
          <p className="text-2xl font-bold text-zinc-900">{stats.totalPosts}</p>
        </div>
        <div className="bg-white/80 p-3 rounded-lg">
          <p className="text-xs text-zinc-600 mb-1">Wyświetlenia</p>
          <p className="text-2xl font-bold text-zinc-900">
            {stats.totalViews.toLocaleString('pl-PL')}
          </p>
        </div>
        <div className="bg-white/80 p-3 rounded-lg">
          <p className="text-xs text-zinc-600 mb-1">Opublikowane</p>
          <p className="text-2xl font-bold text-green-600">{stats.publishedPosts}</p>
        </div>
        <div className="bg-white/80 p-3 rounded-lg">
          <p className="text-xs text-zinc-600 mb-1">Szkice</p>
          <p className="text-2xl font-bold text-yellow-600">{stats.draftPosts}</p>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Link
          href="/admin"
          className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium text-center text-sm"
        >
          Panel Administracyjny
        </Link>
        <Link
          href="/admin/posts/new"
          className="w-full px-4 py-2 bg-white text-red-600 border border-red-600 rounded-lg hover:bg-red-50 transition-colors font-medium text-center text-sm"
        >
          + Nowy Post
        </Link>
      </div>
    </div>
  )
}
