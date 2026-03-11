'use client'

import { useState, useRef, useEffect } from 'react'
import { useStore } from '@/store/useStore'
import { usePathname } from 'next/navigation'
import { sideMenuNavigationLinks } from '@/constants/sideMenuLinks'
import { Pin, X } from 'lucide-react'

import CustomButton from '@/components/CustomButton'
import { Tooltip } from '@/components/Tooltip'

interface SidePanelProps {
  children?: React.ReactNode
  pinnedCount?: number
}

export default function SidePanel({ children, pinnedCount = 0 }: SidePanelProps) {
  const { isSidePanelOpen, toggleSidePanel } = useStore((state) => state)
  const pathname = usePathname()
  const [pinnedOpen, setPinnedOpen] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!pinnedOpen) return
    const handler = (e: MouseEvent) => {
      const target = e.target as Node
      if (
        panelRef.current &&
        buttonRef.current &&
        !panelRef.current.contains(target) &&
        !buttonRef.current.contains(target)
      ) {
        setPinnedOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [pinnedOpen])

  const pinButton = (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={() => setPinnedOpen((v) => !v)}
        className={`relative flex items-center gap-3.5 px-3 py-2 rounded-xl w-full transition-all duration-200
          ${pinnedOpen ? 'text-rose-600' : 'text-zinc-700 hover:text-zinc-900'}
          ${!isSidePanelOpen ? 'justify-center' : ''}`}
      >
        <span className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all duration-200
          ${pinnedOpen
            ? 'bg-gradient-to-br from-rose-100 to-red-50 shadow-sm shadow-rose-200/60'
            : 'bg-zinc-200 border border-zinc-400 hover:bg-zinc-100 hover:shadow-sm'
          }`}
        >
          <Pin size={17} />
        </span>
        {isSidePanelOpen && (
          <>
            <span className={`text-md whitespace-nowrap overflow-hidden ${pinnedOpen ? 'font-semibold' : 'font-medium'}`}>
              Przypięte notatki
            </span>
            {pinnedCount > 0 && (
              <span className="ml-auto text-xs bg-zinc-100 text-zinc-500 rounded-full px-2 py-0.5 font-medium">
                {pinnedCount}
              </span>
            )}
          </>
        )}
      </button>
      {!isSidePanelOpen && pinnedCount > 0 && (
        <span className="absolute top-0.5 right-0.5 w-4 h-4 flex items-center justify-center rounded-full bg-rose-400 text-white text-[10px] font-bold pointer-events-none">
          {pinnedCount}
        </span>
      )}
    </div>
  )

  return (
    <>
      <nav
        className={`z-50 hidden h-full flex-col text-zinc-900 shrink-0
          bg-white border-r border-zinc-200 shadow-[4px_0_16px_rgba(0,0,0,0.04)]
          lg:flex transition-all duration-300
          ${isSidePanelOpen ? 'w-75' : 'w-20'}`}
      >
        {/* Header */}
        <div
          className={`flex items-center h-20 shrink-0 border-b border-zinc-200
            ${isSidePanelOpen ? 'justify-between px-4' : 'justify-center'}`}
        >
          {isSidePanelOpen && (
            <span className="text-xs font-semibold uppercase tracking-widest text-zinc-400">Nawigacja</span>
          )}
          <Tooltip message={isSidePanelOpen ? 'Zamknij' : 'Otwórz'} position="right">
            <button
              onClick={toggleSidePanel}
              className="flex items-center justify-center w-10 h-10 rounded-xl shrink-0
                bg-zinc-200 border border-zinc-400
                hover:bg-zinc-100
                transition-all duration-200 hover:scale-95 shadow-sm"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className={`h-5 w-5 stroke-zinc-600 transition-transform duration-300
                  ${isSidePanelOpen ? 'rotate-180' : 'rotate-0'}`}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
              </svg>
            </button>
          </Tooltip>
        </div>

        {/* Nav links */}
        <div className="flex flex-col flex-1 px-3 py-5 gap-1">
          {sideMenuNavigationLinks.map((navLink) => (
            <CustomButton
              key={navLink.label}
              text={navLink.label}
              href={navLink.url}
              active={navLink.url === pathname}
              showTooltip={!isSidePanelOpen}
            >
              {navLink.icon}
            </CustomButton>
          ))}
        </div>

        {/* Pinned notes button */}
        <div className="px-3 pt-3 pb-2 border-t border-zinc-200">
          {isSidePanelOpen ? (
            pinButton
          ) : (
            <Tooltip message="Przypięte notatki" position="right">
              {pinButton}
            </Tooltip>
          )}
        </div>
      </nav>

      {/* Pinned notes popout */}
      {pinnedOpen && (
        <div
          ref={panelRef}
          className={`fixed bottom-6 z-50 w-80 bg-white border border-zinc-200 rounded-2xl shadow-xl
            ${isSidePanelOpen ? 'lg:left-75' : 'lg:left-20'}`}
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-100">
            <div className="flex items-center gap-2">
              <Pin size={18} className="text-rose-400" />
              <span className="text-md font-semibold text-zinc-800">Przypięte notatki</span>
              {pinnedCount > 0 && (
                <span className="text-xs bg-zinc-100 text-zinc-500 rounded-full px-2 py-0.5">{pinnedCount}</span>
              )}
            </div>
            <button
              onClick={() => setPinnedOpen(false)}
              className="text-zinc-400 hover:text-zinc-600 transition-colors p-1 rounded-lg hover:bg-zinc-100"
            >
              <X size={15} />
            </button>
          </div>
          {children}
        </div>
      )}
    </>
  )
}
