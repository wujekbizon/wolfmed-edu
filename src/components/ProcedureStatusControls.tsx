'use client'

import { useState } from 'react'
import { AlertCircle, Check, Circle, MoreVertical } from 'lucide-react'
import type { ProcedureStatus } from '@/types/dataTypes'

export default function ProcedureStatusControls({
  status,
  onStatusChange,
}: {
  status: ProcedureStatus
  onStatusChange: (status: ProcedureStatus) => void
}) {
  const [showMenu, setShowMenu] = useState(false)
  const selectStatus = (nextStatus: ProcedureStatus) => {
    onStatusChange(nextStatus)
    setShowMenu(false)
  }

  return (
    <>
      {showMenu && (
        <>
          <div className='absolute inset-0 bg-black/20 backdrop-blur-[2px] rounded-2xl z-5 pointer-events-none' />
          <div
            className='fixed inset-0 z-10'
            onClick={() => setShowMenu(false)}
          />
        </>
      )}

      {status === 'ukończone' && (
        <div className='absolute top-3 left-3 bg-emerald-500 text-white rounded-full p-1.5 shadow-md z-10'>
          <Check className='w-4 h-4' />
        </div>
      )}
      {status === 'trudne' && (
        <div className='absolute top-3 left-3 bg-[#ffa5a5] text-white rounded-full p-1.5 shadow-md z-10'>
          <AlertCircle className='w-4 h-4' />
        </div>
      )}

      <div className='absolute top-3 right-3 z-20'>
        <button
          type='button'
          onClick={() => setShowMenu((current) => !current)}
          aria-label='Zmień status procedury'
          className='p-1.5 bg-white/80 hover:bg-white rounded-full border border-transparent hover:border-zinc-200 transition-colors shadow-md backdrop-blur-sm'
        >
          <MoreVertical className='w-5 h-5 text-zinc-600' />
        </button>

        {showMenu && (
          <div className='absolute right-0 top-10 bg-white border border-zinc-200 rounded-lg shadow-xl py-1 min-w-[150px] z-30'>
            <button
              type='button'
              onClick={() => selectStatus('normal')}
              className='w-full px-4 py-2 text-left text-sm text-zinc-700 hover:bg-zinc-100 transition-colors flex items-center gap-2'
            >
              <Circle className='w-4 h-4 text-zinc-400' />
              Normalne
            </button>
            <button
              type='button'
              onClick={() => selectStatus('ukończone')}
              className='w-full px-4 py-2 text-left text-sm text-emerald-700 hover:bg-emerald-50 transition-colors flex items-center gap-2'
            >
              <Check className='w-4 h-4' />
              Ukończone
            </button>
            <button
              type='button'
              onClick={() => selectStatus('trudne')}
              className='w-full px-4 py-2 text-left text-sm text-[#ffa5a5] hover:bg-red-50 transition-colors flex items-center gap-2'
            >
              <AlertCircle className='w-4 h-4' />
              Trudne
            </button>
          </div>
        )}
      </div>
    </>
  )
}
