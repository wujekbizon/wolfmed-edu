'use client'

import { useAuthStore } from '@/store/useAuthStore'

interface TeachingPlaygroundNavbarProps {
  onToggleSidebar: () => void
}

export default function TeachingPlaygroundNavbar({ onToggleSidebar }: TeachingPlaygroundNavbarProps) {
  const { username, logout } = useAuthStore()
  const userInitial = username ? username[0]?.toUpperCase() : ''

  return (
    <nav className="bg-zinc-800 border-b border-zinc-700">
      <div className="max-w-full px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onToggleSidebar}
            className="text-zinc-400 hover:text-zinc-100"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h1 className="text-xl font-semibold bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">
            Teaching Playground
          </h1>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-400 to-violet-400 flex items-center justify-center">
              <span className="text-sm font-medium">{userInitial}</span>
            </div>
            <span className="text-sm text-zinc-400">{username}</span>
          </div>
          <button
            onClick={logout}
            className="px-3 py-1.5 text-sm bg-red-500/10 text-red-400 rounded-md hover:bg-red-500/20 transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  )
} 