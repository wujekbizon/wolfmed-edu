'use client'

import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Pin } from 'lucide-react'
import { useTopPanelStore } from '@/store/useTopPanelStore'
import { useStore } from '@/store/useStore'
import { useScroll } from '@/hooks/useScroll'
import TopCustomButton from '@/components/TopCustomButton'
import DrawerHandle from '@/components/DrawerHandle'

interface TopPanelProps {
  pinnedCount: number
  children: React.ReactNode
}

export default function TopPanel({ pinnedCount, children }: TopPanelProps) {
  const { isTopPanelOpen, toggleTopPanel, activeFeature, setActiveFeature, close } = useTopPanelStore()
  const isSidePanelOpen = useStore((state) => state.isSidePanelOpen)
  const scrollContainer =
  typeof window !== 'undefined'
    ? document.getElementById('scroll-container')
    : null
const { isScrolled } = useScroll(0, scrollContainer)

  const drawerRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!activeFeature) return

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node

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

  const handleTogglePanel = () => {
    if (isTopPanelOpen) {
      close()
      toggleTopPanel()
    } else {
      toggleTopPanel()
    }
  }

  return (
    <>
      <motion.nav
        animate={{
          height: isTopPanelOpen ? 48 : 5
        }}
        transition={{ duration: 0.1, ease: 'easeInOut' }}
        className={`fixed top-20 left-0 right-0 z-40 flex items-center gap-4 px-6 py-2 text-zinc-100 border-b shadow-md transition-all duration-500 ${
          isSidePanelOpen ? 'lg:left-75' : 'lg:left-20'
        } ${
          isScrolled
            ? 'bg-zinc-800/80 backdrop-blur-xl border-zinc-700/50 shadow-xl'
            : 'bg-zinc-800 border-zinc-700'
        }`}
      >
        <DrawerHandle onClick={handleTogglePanel} />
        {isTopPanelOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4, ease: 'easeInOut' }}
          >
            <TopCustomButton
              ref={buttonRef}
              onClick={handlePinnedClick}
              active={activeFeature === 'pinned'}
              badgeCount={pinnedCount}
              icon={<Pin size={24} />}
              tooltipMessage="Przypięte notatki"
            />
          </motion.div>
        )}
      </motion.nav>

      {isTopPanelOpen && activeFeature === 'pinned' && (
        <div
          ref={drawerRef}
          className={`fixed z-35 bg-zinc-800 border border-zinc-700 rounded-b-2xl lg:rounded-r-2xl lg:rounded-bl-none shadow-2xl transition-all duration-500 left-0 right-0 lg:right-auto lg:w-80 ${
            isSidePanelOpen ? 'lg:left-75' : 'lg:left-20'
          } ${isScrolled ? 'top-32' : 'top-[128px]'}`}
        >
          {children}
        </div>
      )}
    </>
  )
}
