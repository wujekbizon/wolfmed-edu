'use client'

import { useAuthStore } from '@/store/useAuthStore'

export default function TeachingPlaygroundLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, username } = useAuthStore()

  return (
    <div className="min-h-[calc(100vh_-_70px)] bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <h1 className="text-xl font-semibold">Teaching Playground</h1>
          <div className="flex items-center gap-4">
            {isAuthenticated && username && (
              <span className="text-sm text-gray-500">Logged in as {username}</span>
            )}
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">{children}</main>
    </div>
  )
}
