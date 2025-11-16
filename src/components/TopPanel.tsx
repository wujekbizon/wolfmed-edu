'use client'

import { useState, useEffect, useRef } from 'react'
import { Pin } from 'lucide-react'
import { useTopPanelStore } from '@/store/useTopPanelStore'
import { useStore } from '@/store/useStore'
import { useScroll } from '@/hooks/useScroll'
import { usePathname } from 'next/navigation'
import TopCustomButton from '@/components/TopCustomButton'

interface TopPanelProps {
  pinnedCount: number
  children: React.ReactNode
}

export default function TopPanel({ pinnedCount, children }: TopPanelProps) {
  const { activeFeature, setActiveFeature, close } = useTopPanelStore()
  const isSidePanelOpen = useStore((state) => state.isSidePanelOpen)
  const scrollContainer =
  typeof window !== 'undefined'
    ? document.getElementById('scroll-container')
    : null
const { isScrolled } = useScroll(0, scrollContainer)

  const drawerRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  // Click outside to close drawer
  useEffect(() => {
    if (!activeFeature) return

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node

      // Check if click is outside both drawer and button
      if (
        drawerRef.current &&
        buttonRef.current &&
        !drawerRef.current.contains(target) &&
        !buttonRef.current.contains(target)
      ) {
        close()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [activeFeature, close])

  const handlePinnedClick = () => {
    setActiveFeature(activeFeature === 'pinned' ? null : 'pinned')
  }
  return (
    <>
      <nav
        className={`fixed top-20 left-0 right-0 z-40 h-12 flex items-center gap-4 px-6 py-2 text-zinc-100 border-b shadow-md transition-all duration-500 ${
          isSidePanelOpen ? 'lg:left-75' : 'lg:left-20'
        } ${
          isScrolled
            ? 'bg-zinc-800/70 backdrop-blur-xl border-zinc-700/50 shadow-xl fixed top-0'
            : 'bg-zinc-800 border-zinc-700'
        }`}
      >
        <TopCustomButton
          ref={buttonRef}
          onClick={handlePinnedClick}
          active={activeFeature === 'pinned'}
          badgeCount={pinnedCount}
          icon={<Pin size={24} />}
          tooltipMessage="Przypięte notatki"
        />
      </nav>

      {activeFeature === 'pinned' && (
        <div
          ref={drawerRef}
          className={`fixed top-29 z-35 bg-zinc-800 border border-zinc-700 rounded-b-2xl lg:rounded-r-2xl lg:rounded-bl-none shadow-2xl transition-all duration-500 left-0 right-0 lg:right-auto lg:w-80 ${
            isSidePanelOpen ? 'lg:left-75' : 'lg:left-20'
          }`}
        >
          {children}
        </div>
      )}
    </>
  )
}
