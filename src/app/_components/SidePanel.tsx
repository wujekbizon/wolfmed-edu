'use client'

import { useState, useRef, useEffect } from 'react'
import { useStore } from '@/store/useStore'
import { usePathname } from 'next/navigation'
import { sideMenuNavigationLinks } from '@/constants/sideMenuLinks'
import CustomButton from '@/components/CustomButton'
import { Tooltip } from '@/components/Tooltip'
import PinButton from '../../components/PinButton'
import { Settings, Sparkles } from 'lucide-react'
import { useSettingsModalStore } from '@/store/useSettingsModalStore'
import SideAIInput from '@/components/SideAIInput'

interface SidePanelProps {
  children?: React.ReactNode
  pinnedCount?: number
}

export default function SidePanel({
  children,
  pinnedCount = 0
}: SidePanelProps) {
  const { isSidePanelOpen, toggleSidePanel } = useStore((state) => state)
  const { openSettingsModal } = useSettingsModalStore()
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
    <PinButton
      ref={buttonRef}
      isOpen={pinnedOpen}
      isSidebarOpen={isSidePanelOpen}
      pinnedCount={pinnedCount}
      onClick={() => setPinnedOpen((v) => !v)}
    />
  )

  return (
    <>
      <nav
        className={`z-50 hidden h-full flex-col text-zinc-900 shrink-0
     bg-white border-r border-zinc-200 shadow-[4px_0_16px_rgba(0,0,0,0.04)]
          lg:flex transition-all duration-300
          ${isSidePanelOpen ? 'w-75' : 'w-20'}`}
      >
        <div
          className={`flex items-center h-16 shrink-0 border-b border-zinc-100
            ${isSidePanelOpen ? 'justify-end px-4' : 'justify-center'}`}
        >
          <button
            onClick={toggleSidePanel}
            className='flex items-center justify-center w-8 h-8 rounded-lg
              text-zinc-300 hover:text-zinc-600 hover:bg-zinc-100
              transition-all duration-200 cursor-pointer'
          >
            <svg
              xmlns='http://www.w3.org/2000/svg'
              fill='none'
              viewBox='0 0 24 24'
              strokeWidth={1.5}
              stroke='currentColor'
              className={`h-5 w-5 stroke-current animate-pulse transition-transform duration-300
                ${isSidePanelOpen ? 'rotate-180' : 'rotate-0'}`}
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                d='M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3'
              />
            </svg>
          </button>
        </div>

        <div className='flex flex-col flex-1 px-4 py-3 gap-3 min-h-0'>
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

          {isSidePanelOpen && (
            <div className='mt-auto pt-3 border-t border-zinc-100'>
              <SideAIInput />
            </div>
          )}
        </div>

        <div className='px-3 pt-3 pb-2 border-t border-zinc-200 flex flex-col gap-2'>
          {!isSidePanelOpen && (
            <Tooltip message='Asystent AI' position='right'>
              <button
                onClick={toggleSidePanel}
                className='group relative flex items-center justify-center px-3 py-2 rounded-xl w-full cursor-pointer transition-all duration-200 text-zinc-700 hover:text-zinc-900'
              >
                <span className='w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all duration-200 bg-zinc-200 border border-zinc-400 group-hover:bg-zinc-100 group-hover:shadow-sm'>
                  <span className='transition-transform duration-200 group-hover:scale-110'>
                    <Sparkles size={17} />
                  </span>
                </span>
              </button>
            </Tooltip>
          )}
          {isSidePanelOpen ? (
            pinButton
          ) : (
            <Tooltip message='Przypięte notatki' position='right'>
              {pinButton}
            </Tooltip>
          )}
          {isSidePanelOpen ? (
            <button
              onClick={openSettingsModal}
              className='group relative flex items-center gap-3.5 px-3 py-2 rounded-xl w-full cursor-pointer transition-all duration-200 text-zinc-700 hover:text-zinc-900'
            >
              <span className='w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all duration-200 bg-zinc-200 border border-zinc-400 group-hover:bg-zinc-100 group-hover:shadow-sm'>
                <span className='transition-transform duration-200 group-hover:scale-110'>
                  <Settings size={17} />
                </span>
              </span>
              <span className='text-md font-medium whitespace-nowrap overflow-hidden'>Ustawienia</span>
            </button>
          ) : (
            <Tooltip message='Ustawienia' position='right'>
              <button
                onClick={openSettingsModal}
                className='group relative flex items-center justify-center px-3 py-2 rounded-xl w-full cursor-pointer transition-all duration-200 text-zinc-700 hover:text-zinc-900'
              >
                <span className='w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all duration-200 bg-zinc-200 border border-zinc-400 group-hover:bg-zinc-100 group-hover:shadow-sm'>
                  <span className='transition-transform duration-200 group-hover:scale-110'>
                    <Settings size={17} />
                  </span>
                </span>
              </button>
            </Tooltip>
          )}
        </div>
      </nav>

      {pinnedOpen && (
        <div
          ref={panelRef}
          className={`fixed top-20 bottom-0 z-40 w-96 bg-white flex flex-col
            border-r border-zinc-200
            ${isSidePanelOpen ? 'left-75' : 'left-20'}`}
        >
          <div className='flex-1 overflow-y-auto scrollbar-webkit'>
            {children}
          </div>
        </div>
      )}
    </>
  )
}
