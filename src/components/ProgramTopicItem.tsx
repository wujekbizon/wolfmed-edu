"use client"

import Link from 'next/link'
import { useState } from 'react'

interface ProgramTopicItemProps {
  item: string
  categoryId: string
}

export default function ProgramTopicItem({ item, categoryId }: ProgramTopicItemProps) {
  const [isHovered, setIsHovered] = useState(false)

  // Create slugified topic for URL
  const topicSlug = item
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-ąćęłńóśźż]/g, '')
    .slice(0, 100)

  return (
    <li
      className='relative flex gap-2 text-gray-700 text-sm pl-7 group'
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <span className='text-zinc-400 shrink-0'>•</span>
      <span className='flex-1'>{item}</span>
      {isHovered && (
        <Link
          href={`/panel/nauka?category=${categoryId}&topic=${encodeURIComponent(topicSlug)}`}
          className='absolute right-0 px-3 py-1 bg-zinc-800 text-white text-xs rounded hover:bg-zinc-700 transition-colors whitespace-nowrap'
        >
          Rozpocznij naukę interaktywną
        </Link>
      )}
    </li>
  )
}
