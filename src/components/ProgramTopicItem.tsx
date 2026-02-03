"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Sparkles } from 'lucide-react'
import { useRagStore } from '@/store/useRagStore'

interface ProgramTopicItemProps {
  item: string
  categoryId: string
}

export default function ProgramTopicItem({ item, categoryId }: ProgramTopicItemProps) {
  const [isHovered, setIsHovered] = useState(false)
  const router = useRouter()
  const setPendingTopic = useRagStore((state) => state.setPendingTopic)

  const handleClick = () => {
    setPendingTopic(item)
    router.push('/panel/nauka')
  }

  return (
    <li
      className='flex gap-2 text-gray-700 text-sm pl-7 py-1'
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <span className='text-zinc-400 shrink-0'>•</span>
      <span className='flex items-center gap-2 flex-wrap'>
        <span>{item}</span>
        <button
          onClick={handleClick}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-slate-600 to-rose-600 text-white text-xs rounded-full shadow-lg hover:shadow-xl hover:from-slate-700 hover:to-rose-700 transition-all whitespace-nowrap ${
            isHovered ? 'opacity-100 visible' : 'opacity-0 invisible'
          }`}
        >
          <Sparkles className='w-3.5 h-3.5' />
          <span>Wyjaśnij z AI</span>
        </button>
      </span>
    </li>
  )
}
