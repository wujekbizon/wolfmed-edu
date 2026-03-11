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
        bg-gradient-to-b from-white to-rose-50
        border-r border-rose-100 shadow-[4px_0_20px_rgba(0,0,0,0.05)]
        lg:flex transition-all duration-300
        ${isSidePanelOpen ? 'w-75' : 'w-20'}`}
    >
      {/* Header */}
      <div
        className={`flex items-center h-20 shrink-0 border-b border-rose-100/60
          ${isSidePanelOpen ? 'justify-end px-4' : 'justify-center'}`}
      >
        <Tooltip message={isSidePanelOpen ? 'Zamknij' : 'Otwórz'} position="right">
          <button
            onClick={toggleSidePanel}
            className="flex items-center justify-center w-9 h-9 rounded-xl shrink-0
              bg-white border border-rose-100
              hover:bg-[#ffc5c5]/70 hover:border-rose-200
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
        <div className="px-5 py-4 border-t border-rose-100/60 shrink-0">
          <p className="text-xs text-zinc-400 text-center tracking-wide">© 2026 Wolfmed-Edukacja</p>
        </div>
      )}
    </nav>
  )
}
