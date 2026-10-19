'use client'

import { LoaderCircle } from 'lucide-react'
import WolfekAvatar from '@/components/wolfek/WolfekAvatar'
import type { RagWolfekHeaderProps } from '@/types/ragCellUiTypes'

export default function RagWolfekHeader({ pending }: RagWolfekHeaderProps) {
  return (
    <header className='flex shrink-0 items-center gap-2.5 border-b border-rose-100/70 bg-linear-to-r from-rose-50/70 via-white to-violet-50/50 px-3 py-1.5'>
      <div className='h-10 w-10 shrink-0'>
        <WolfekAvatar positive={false} supportive interactive={false} />
      </div>
      <div className='min-w-0 flex-1'>
        <h3 className='text-sm font-semibold tracking-tight text-zinc-800'>Wolfek <span className='font-normal text-zinc-400'>· Asystent AI</span></h3>
        <p className='text-[11px] text-zinc-500'>{pending ? 'Szukam odpowiedzi dla Ciebie…' : 'Porozmawiajmy o tym, czego się uczysz'}</p>
      </div>
      {pending && <LoaderCircle size={16} aria-hidden='true' className='shrink-0 animate-spin text-[#a18abf] motion-reduce:animate-none' />}
    </header>
  )
}
