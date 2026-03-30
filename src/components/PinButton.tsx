'use client'

import { forwardRef } from 'react'
import { Pin } from 'lucide-react'

interface PinButtonProps {
  isOpen: boolean
  isSidebarOpen: boolean
  pinnedCount: number
  onClick: () => void
}

const iconClass = (isOpen: boolean) =>
  `w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all duration-200 ${
    isOpen
      ? 'bg-linear-to-r from-[#f65555]/90 to-[#ffc5c5]/90 shadow-sm shadow-rose-200/60 border border-zinc-700/80'
      : 'bg-zinc-200 border border-zinc-400 group-hover:bg-zinc-100 group-hover:shadow-sm'
  }`

const PinButton = forwardRef<HTMLButtonElement, PinButtonProps>(
  ({ isOpen, isSidebarOpen, pinnedCount, onClick }, ref) => (
    <div className='relative'>
      <button
        ref={ref}
        onClick={onClick}
        className={`group relative flex items-center gap-3.5 px-3 py-2 rounded-xl w-full cursor-pointer transition-all duration-200
          ${isOpen ? 'text-zinc-950' : 'text-zinc-700 hover:text-zinc-900'}
          ${!isSidebarOpen ? 'justify-center' : ''}`}
      >
        <span className={iconClass(isOpen)}>
          <span className='transition-transform duration-200 group-hover:scale-110'>
            <Pin size={17} />
          </span>
        </span>

        {isSidebarOpen && (
          <>
            <span
              className={`text-md whitespace-nowrap overflow-hidden ${isOpen ? 'font-semibold' : 'font-medium'}`}
            >
              Przypięte notatki
            </span>
            {pinnedCount > 0 && (
              <span className='ml-auto text-xs bg-zinc-100 text-zinc-500 rounded-full px-2 py-0.5 font-medium'>
                {pinnedCount}
              </span>
            )}
          </>
        )}
      </button>

      {!isSidebarOpen && pinnedCount > 0 && (
        <span className='absolute top-0.5 right-0.5 w-4 h-4 flex items-center justify-center rounded-full bg-[#f65555] border border-zinc-800 text-white text-[10px] font-bold pointer-events-none'>
          {pinnedCount}
        </span>
      )}
    </div>
  )
)

export default PinButton