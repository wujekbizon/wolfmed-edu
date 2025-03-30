'use client'

import { useAuthStore } from '@/store/useAuthStore'
import { useState } from 'react'
import clsx from 'clsx'

// Navigation items for the sidebar
const navigationItems = [
  {
    id: 'lectures',
    name: 'Lectures',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
  },
  {
    id: 'rooms',
    name: 'Rooms',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2v16z" />
      </svg>
    ),
  },
  {
    id: 'communication',
    name: 'Communication',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
  },
  {
    id: 'data',
    name: 'Data Management',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
      </svg>
    ),
  },
  {
    id: 'settings',
    name: 'Settings',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
]

export default function TeachingPlaygroundLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, username, logout } = useAuthStore()
  const [activeSection, setActiveSection] = useState('lectures')
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)

  const userInitial = username ? username[0]?.toUpperCase() : ''

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
          {isAuthenticated && username && (
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
          )}
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
                <button
                  onClick={() => setActiveSection(item.id)}
                  className={clsx(
                    'w-full flex items-center gap-3 px-3 py-2 rounded-md transition-colors',
                    isSidebarCollapsed ? 'justify-center' : '',
                    activeSection === item.id
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
                </button>
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
