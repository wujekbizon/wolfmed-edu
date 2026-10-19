'use client'

import type { RagWolfekProgressProps } from '@/types/ragCellUiTypes'
import RagProgressIndicator from './RagProgressIndicator'

export default function RagWolfekProgress({ progress }: RagWolfekProgressProps) {
  return (
    <div className='space-y-2 rounded-2xl rounded-tl-sm border border-violet-100 bg-white/90 p-3 text-sm text-zinc-600' aria-live='polite'>
      <p className='flex items-center gap-2'>
        <span aria-hidden='true' className='h-2 w-2 animate-pulse rounded-full bg-[#b49acb] motion-reduce:animate-none' />
        {progress.message || 'Wolfek myśli…'}
      </p>
      <details className='text-xs'>
        <summary className='w-fit cursor-pointer py-1 text-zinc-400 hover:text-zinc-600'>Szczegóły</summary>
        <div className='mt-2'><RagProgressIndicator {...progress} /></div>
      </details>
    </div>
  )
}
