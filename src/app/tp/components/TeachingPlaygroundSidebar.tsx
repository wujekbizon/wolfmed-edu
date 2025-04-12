'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import clsx from 'clsx'
import { navigationItems } from '@/constants/navigation'

interface TeachingPlaygroundSidebarProps {
  isCollapsed: boolean
}

export default function TeachingPlaygroundSidebar({ isCollapsed }: TeachingPlaygroundSidebarProps) {
  const pathname = usePathname()

  return (
    <aside
      className={clsx(
        'bg-zinc-800 border-r border-zinc-700 transition-all duration-300',
        isCollapsed ? 'w-16' : 'w-64'
      )}
    >
      <nav className="p-4 space-y-2">
        {navigationItems.map((item) => (
          <div key={item.id} className="relative group">
            <Link
              href={item.path}
              className={clsx(
                'w-full flex items-center gap-3 px-3 py-2 rounded-md transition-colors',
                isCollapsed ? 'justify-center' : '',
                pathname === item.path
                  ? 'bg-blue-500/10 text-blue-400'
                  : 'text-zinc-400 hover:bg-zinc-700/50 hover:text-zinc-100'
              )}
            >
              <div className={clsx(
                'flex items-center justify-center',
                isCollapsed ? 'w-8 h-8' : 'w-6 h-6'
              )}>
                {item.icon}
              </div>
              {!isCollapsed && <span>{item.name}</span>}
            </Link>
            {isCollapsed && (
              <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2 py-1 bg-zinc-800 text-zinc-100 text-sm rounded-md opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                {item.name}
              </div>
            )}
          </div>
        ))}
      </nav>
    </aside>
  )
} 