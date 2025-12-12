import { requireAdmin } from '@/lib/adminHelpers'
import { Suspense } from 'react'
import { Metadata } from 'next'
import AdminHeader from '@/components/blog/admin/AdminHeader'

export const metadata: Metadata = {
  title: 'Admin Panel - Wolfmed Blog',
  description: 'Panel administracyjny dla zarządzania blogiem medycznym',
  robots: 'noindex, nofollow',
}

async function AdminGuard({ children }: { children: React.ReactNode }) {
  await requireAdmin()
  return <>{children}</>
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-zinc-50 flex items-center justify-center">Ładowanie...</div>}>
      <AdminGuard>
        <div className="min-h-[calc(100vh-80px)] bg-zinc-50">
          <AdminHeader />
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </main>
        </div>
      </AdminGuard>
    </Suspense>
  )
}
