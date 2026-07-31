import { Suspense } from 'react'
import Link from 'next/link'
import { Metadata } from 'next'
import AdminNav from '@/components/admin/AdminNav'
import AdminNavBadged from '@/components/admin/AdminNavBadged'
import { requireAdmin } from '@/helpers/requireAdmin'

export const metadata: Metadata = {
  title: 'Admin Panel - Wolfmed Blog',
  description: 'Panel administracyjny dla zarządzania blogiem medycznym',
  robots: 'noindex, nofollow',
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await requireAdmin()

  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="bg-zinc-900 border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-8">
              <h1 className="text-xl font-bold text-red-500">
                Admin Panel
              </h1>
              <Suspense fallback={<AdminNav variant="desktop" />}>
                <AdminNavBadged variant="desktop" />
              </Suspense>
            </div>
            <div>
              <Link
                href="/blog"
                className="text-zinc-300 hover:text-white text-sm font-medium transition-colors"
              >
                ← Powrót do Bloga
              </Link>
            </div>
          </div>
          <Suspense fallback={<AdminNav variant="mobile" />}>
            <AdminNavBadged variant="mobile" />
          </Suspense>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  )
}
