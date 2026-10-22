'use client'

import { useEffect, useState } from 'react'
import { WOLFEK_PENDING_MESSAGES, WOLFEK_PENDING_MESSAGE_INTERVAL_MS } from '@/constants/wolfekMessages'

export default function RagWolfekProgress() {
  const [messageIndex, setMessageIndex] = useState(0)
  useEffect(() => {
    const timer = window.setInterval(() => {
      setMessageIndex((index) => (index + 1) % WOLFEK_PENDING_MESSAGES.length)
    }, WOLFEK_PENDING_MESSAGE_INTERVAL_MS)
    return () => window.clearInterval(timer)
  }, [])
  return (
    <div className='space-y-2 rounded-2xl rounded-tl-sm border border-violet-100 bg-white/90 p-3 text-sm text-zinc-600' aria-live='polite'>
      <p className='flex items-center gap-2'>
        <span aria-hidden='true' className='h-2 w-2 animate-pulse rounded-full bg-[#b49acb] motion-reduce:animate-none' />
        {WOLFEK_PENDING_MESSAGES[messageIndex]}
      </p>
    </div>
  )
}
