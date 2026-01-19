"use client"

import Link from 'next/link'
import { useState } from 'react'
import { Sparkles } from 'lucide-react'

interface ProgramTopicItemProps {
  item: string
  categoryId: string
}

export default function ProgramTopicItem({ item, categoryId }: ProgramTopicItemProps) {
  const [isHovered, setIsHovered] = useState(false)

  const topicSlug = item
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-ąćęłńóśźż]/g, '')
    .slice(0, 100)

  return (
    <li
      className='flex gap-2 text-gray-700 text-sm pl-7 py-1'
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <span className='text-zinc-400 shrink-0'>•</span>
      <span className='flex items-center gap-2 flex-wrap'>
        <span>{item}</span>
        <Link
          href={`/panel/nauka?category=${categoryId}&topic=${encodeURIComponent(topicSlug)}`}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-slate-600 to-rose-600 text-white text-xs rounded-full shadow-lg hover:shadow-xl hover:from-slate-700 hover:to-rose-700 transition-all whitespace-nowrap ${
            isHovered ? 'opacity-100 visible' : 'opacity-0 invisible'
          }`}
        >
          <Sparkles className='w-3.5 h-3.5' />
          <span>Wyjaśnij z AI</span>
        </Link>
      </span>
    </li>
  )
}
