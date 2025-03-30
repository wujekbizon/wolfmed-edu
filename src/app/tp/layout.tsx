'use client'

import { useAuthStore } from '@/store/useAuthStore'
import { useState } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import clsx from 'clsx'
import { navigationItems } from '@/constants/navigation'

export default function TeachingPlaygroundLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, username, logout } = useAuthStore()
  const pathname = usePathname()
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)

  const userInitial = username ? username[0]?.toUpperCase() : ''

  if (!isAuthenticated) {
    return children
  }

  return (
    <div className="h-[calc(100vh-6px)] bg-zinc-900 text-zinc-100">
      {/* Top Navigation Bar */}
      <nav className="bg-zinc-800 border-b border-zinc-700">
        <div className="max-w-full px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
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

      <div className="flex h-[calc(100vh-73px)]">
        {/* Sidebar Navigation */}
        <aside
          className={clsx(
            'bg-zinc-800 border-r border-zinc-700 transition-all duration-300',
            isSidebarCollapsed ? 'w-16' : 'w-64'
          )}
        >
          <nav className="p-4 space-y-2">
            {navigationItems.map((item) => (
              <div key={item.id} className="relative group">
                <Link
                  href={item.path}
                  className={clsx(
                    'w-full flex items-center gap-3 px-3 py-2 rounded-md transition-colors',
                    isSidebarCollapsed ? 'justify-center' : '',
                    pathname === item.path
                      ? 'bg-blue-500/10 text-blue-400'
                      : 'text-zinc-400 hover:bg-zinc-700/50 hover:text-zinc-100'
                  )}
                >
                  <div className={clsx(
                    'flex items-center justify-center',
                    isSidebarCollapsed ? 'w-8 h-8' : 'w-6 h-6'
                  )}>
                    {item.icon}
                  </div>
                  {!isSidebarCollapsed && <span>{item.name}</span>}
                </Link>
                {isSidebarCollapsed && (
                  <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2 py-1 bg-zinc-800 text-zinc-100 text-sm rounded-md opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                    {item.name}
                  </div>
                )}
              </div>
            ))}
          </nav>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-auto scrollbar-webkit">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
