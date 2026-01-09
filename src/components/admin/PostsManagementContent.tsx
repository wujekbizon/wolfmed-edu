'use client'

import Link from 'next/link'
import { formatDate } from '@/lib/blogUtils'
import { useDashboardStore } from '@/store/useDashboardStore'
import DeletePostButton from '@/components/admin/DeletePostButton'
import DeletePostModal from '@/components/admin/DeletePostModal'
import type { BlogPost } from '@/types/dataTypes'

interface PostsManagementContentProps {
  posts: BlogPost[]
}

export default function PostsManagementContent({ posts }: PostsManagementContentProps) {
  const { isDeleteModalOpen, postIdToDelete } = useDashboardStore()

  return (
    <div>
      {/* Delete Modal */}
      {isDeleteModalOpen && postIdToDelete && <DeletePostModal postId={postIdToDelete} />}

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900">Zarządzanie Postami</h1>
          <p className="text-zinc-600 mt-2">
            Wszystkie posty blogowe ({posts.length})
          </p>
        </div>
        <Link
          href="/admin/posts/new"
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 font-medium"
        >
          + Nowy Post
        </Link>
      </div>

      {/* Posts Table */}
      {posts.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-zinc-200 p-12 text-center">
          <div className="max-w-sm mx-auto">
            <svg
              className="w-16 h-16 text-zinc-400 mx-auto mb-4"
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
            <h3 className="text-lg font-semibold text-zinc-900 mb-2">
              Brak postów
            </h3>
            <p className="text-zinc-600 mb-4">
              Zacznij od utworzenia pierwszego posta na blogu
            </p>
            <Link
              href="/admin/posts/new"
              className="inline-block px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 font-medium"
            >
              Utwórz Pierwszy Post
            </Link>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-zinc-200 overflow-hidden">
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-zinc-50 border-b border-zinc-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">
                    Tytuł
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">
                    Statystyki
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">
                    Data
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-zinc-500 uppercase tracking-wider">
                    Akcje
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {posts.map((post) => (
                  <tr key={post.id} className="hover:bg-zinc-50">
                    <td className="px-6 py-4">
                      <div className="flex items-start">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-zinc-900 truncate">
                            {post.title}
                          </p>
                          <p className="text-sm text-zinc-500 truncate">
                            /blog/{post.slug}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
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
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-500">
                      <div className="flex flex-col gap-1">
                        <span>👁️ {post.viewCount}</span>
                        {post.readingTime && <span>📖 {post.readingTime} min</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-500">
                      {formatDate(post.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        {post.status === 'published' && (
                          <Link
                            href={`/blog/${post.slug}`}
                            target="_blank"
                            className="text-zinc-600 hover:text-zinc-900"
                          >
                            Zobacz
                          </Link>
                        )}
                        <Link
                          href={`/admin/posts/${post.id}/edit`}
                          className="text-red-600 hover:text-red-900"
                        >
                          Edytuj
                        </Link>
                        <DeletePostButton postId={post.id} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden divide-y divide-zinc-200">
            {posts.map((post) => (
              <div key={post.id} className="p-4">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-zinc-900 truncate">
                      {post.title}
                    </h3>
                    <p className="text-xs text-zinc-500 truncate">
                      /blog/{post.slug}
                    </p>
                  </div>
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
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
                </div>
                <div className="flex items-center gap-3 text-xs text-zinc-500 mb-3">
                  <span>👁️ {post.viewCount}</span>
                  {post.readingTime && <span>📖 {post.readingTime} min</span>}
                  <span>{formatDate(post.createdAt)}</span>
                </div>
                <div className="flex items-center gap-2">
                  {post.status === 'published' && (
                    <Link
                      href={`/blog/${post.slug}`}
                      target="_blank"
                      className="flex-1 text-center px-3 py-1.5 text-sm font-medium text-zinc-600 hover:text-zinc-900 border border-zinc-300 rounded-md"
                    >
                      Zobacz
                    </Link>
                  )}
                  <Link
                    href={`/admin/posts/${post.id}/edit`}
                    className="flex-1 text-center px-3 py-1.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md"
                  >
                    Edytuj
                  </Link>
                  <DeletePostButton postId={post.id} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
