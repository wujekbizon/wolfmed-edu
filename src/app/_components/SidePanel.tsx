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
        className={`group relative flex items-center gap-3.5 px-3 py-2 rounded-xl w-full cursor-pointer transition-all duration-200
          ${pinnedOpen ? 'text-zinc-950' : 'text-zinc-700 hover:text-zinc-900'}
          ${!isSidePanelOpen ? 'justify-center' : ''}`}
      >
        <span className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all duration-200
          ${pinnedOpen
            ? 'bg-linear-to-r from-[#f65555]/90 to-[#ffc5c5]/90 shadow-sm shadow-rose-200/60'
            : 'bg-zinc-200 border border-zinc-400 group-hover:bg-zinc-100 group-hover:shadow-sm'
          }`}
        >
          <span className="transition-transform duration-200 group-hover:scale-110">
            <Pin size={17} />
          </span>
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
            ${isSidePanelOpen ? 'justify-end px-4' : 'justify-center'}`}
        >
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
          className={`fixed top-20 bottom-0 z-40 w-96 bg-white flex flex-col
            border-r border-t border-b border-zinc-200
            shadow-[4px_0_16px_rgba(0,0,0,0.06)]
            ${isSidePanelOpen ? 'left-75' : 'left-20'}`}
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-200 shrink-0">
            <div className="flex items-center gap-2.5">
              <Pin size={16} className="text-rose-400" />
              <span className="text-sm font-semibold text-zinc-800">Przypięte notatki</span>
              {pinnedCount > 0 && (
                <span className="text-xs bg-zinc-100 text-zinc-500 rounded-full px-2 py-0.5 font-medium">{pinnedCount}</span>
              )}
            </div>
            <button
              onClick={() => setPinnedOpen(false)}
              className="cursor-pointer text-zinc-400 hover:text-zinc-600 transition-colors p-1.5 rounded-lg hover:bg-zinc-100"
            >
              <X size={15} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto scrollbar-webkit">
            {children}
          </div>
        </div>
      )}
    </>
  )
}
