'use client'

import { useStore } from '@/store/useStore'
import { usePathname } from 'next/navigation'
import { sideMenuNavigationLinks } from '@/constants/sideMenuLinks'

import CustomButton from '@/components/CustomButton'
import { Tooltip } from '@/components/Tooltip'

export default function SidePanel() {
  const { isSidePanelOpen, toggleSidePanel } = useStore((state) => state)
  const pathname = usePathname()

  return (
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
            className="flex items-center justify-center w-9 h-9 rounded-xl shrink-0
              bg-zinc-50 border border-zinc-200
              hover:bg-zinc-100 hover:border-zinc-300
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

      {/* Footer */}
      {isSidePanelOpen && (
        <div className="px-5 py-4 border-t border-zinc-200 shrink-0">
          <p className="text-xs text-zinc-400 text-center tracking-wide">© 2026 Wolfmed-Edukacja</p>
        </div>
      )}
    </nav>
  )
}
