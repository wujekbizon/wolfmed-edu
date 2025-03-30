'use client'

import { useAuthStore } from '@/store/useAuthStore'
import { useState } from 'react'
import TeachingPlaygroundNavbar from './components/TeachingPlaygroundNavbar'
import TeachingPlaygroundSidebar from './components/TeachingPlaygroundSidebar'

interface TeachingPlaygroundLayoutProps {
  children: React.ReactNode
}

export default function TeachingPlaygroundLayout({ children }: TeachingPlaygroundLayoutProps) {
  const { isAuthenticated } = useAuthStore()
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)

  if (!isAuthenticated) {
    return children
  }

  return (
    <div className="h-[calc(100vh-6px)] bg-zinc-900 text-zinc-100">
      <TeachingPlaygroundNavbar 
        onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)} 
      />

      <div className="flex h-[calc(100vh-73px)]">
        <TeachingPlaygroundSidebar isCollapsed={isSidebarCollapsed} />

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
