'use client'

import { useStore } from '@/store/useStore'
import { usePathname } from 'next/navigation'
import Image from 'next/image'
import { sideMenuNavigationLinks } from '@/constants/sideMenuLinks'
import CustomButton from '@/components/CustomButton'
import { Tooltip } from '@/components/Tooltip'

export default function SidePanel() {
  const { isSidePanelOpen, toggleSidePanel } = useStore((state) => state)
  const pathname = usePathname()

  return (
    <nav
      className={`z-50 hidden h-full flex-col text-zinc-900 shrink-0
        bg-gradient-to-br from-white/60 to-rose-50/50 backdrop-blur-xl
        border-r border-white/50 shadow-2xl shadow-zinc-950/20
        lg:flex transition-all duration-300 overflow-hidden
        ${isSidePanelOpen ? 'w-75' : 'w-20'}`}
    >
      {/* Header */}
      <div
        className={`flex items-center h-20 shrink-0 border-b border-white/40
          ${isSidePanelOpen ? 'px-4 justify-between' : 'px-2 justify-between'}`}
      >
        <div
          className={`rounded-full border border-zinc-400 shrink-0 overflow-hidden bg-zinc-200 transition-all duration-300
            ${isSidePanelOpen ? 'w-10 h-10' : 'w-8 h-8'}`}
        >
          <Image
            src="https://utfs.io/a/zw3dk8dyy9/UVAwLrIxs2k5UOm8ArIxs2k5EyuGdN4SRigYP6qreJDvtVZl"
            alt="Wolfmed logo"
            width={40}
            height={40}
            className="h-full w-full object-cover"
            priority
          />
        </div>

        {isSidePanelOpen && (
          <span className="text-sm font-black tracking-wide text-zinc-900 whitespace-nowrap overflow-hidden">
            WOLFMED <span className="font-normal text-zinc-500">EDU</span>
          </span>
        )}

        <Tooltip message={isSidePanelOpen ? 'Zamknij' : 'Otwórz'} position="right">
          <button
            onClick={toggleSidePanel}
            className={`flex items-center justify-center rounded-xl shrink-0
              bg-white/50 border border-white/60
              hover:bg-[#ffc5c5]/70 hover:border-rose-200/60
              transition-all duration-200 hover:scale-95 shadow-sm
              ${isSidePanelOpen ? 'w-9 h-9' : 'w-8 h-8'}`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className={`stroke-zinc-700 transition-transform duration-300
                ${isSidePanelOpen ? 'h-5 w-5 rotate-180' : 'h-4 w-4 rotate-0'}`}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
            </svg>
          </button>
        </Tooltip>
      </div>

      {/* Nav links */}
      <div className="flex flex-col flex-1 px-3 py-5 gap-1 overflow-y-auto">
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
        <div className="px-5 py-4 border-t border-white/40 shrink-0">
          <p className="text-xs text-zinc-500 text-center tracking-wide">© 2026 Wolfmed-Edukacja</p>
        </div>
      )}
    </nav>
  )
}
