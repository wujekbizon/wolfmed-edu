"use client"

import { useRouter } from 'next/navigation'
import { Sparkles, Lock, BookOpen } from 'lucide-react'
import { useRagStore } from '@/store/useRagStore'
import TopicActionButton from './TopicActionButton'

interface ProgramTopicItemProps {
  item: string
  categoryId: string
  isPremium?: boolean
}

export default function ProgramTopicItem({ item, isPremium = false }: ProgramTopicItemProps) {
  const router = useRouter()
  const setPendingTopic = useRagStore((state) => state.setPendingTopic)

  const openInAssistant = (topic: string) => {
    setPendingTopic(topic)
    router.push('/panel/nauka')
  }

  return (
    <li className='group flex items-start gap-2 pl-1 sm:pl-7 py-1 text-sm text-gray-700'>
      <span className='shrink-0 text-zinc-400'>•</span>
      <span className='flex-1 min-w-0 break-words'>{item}</span>

      {isPremium ? (
        <span className='flex shrink-0 items-center gap-1.5'>
          <TopicActionButton
            icon={Sparkles}
            label='Wyjaśnij z AI'
            gradientClassName='bg-gradient-to-r from-slate-600 to-rose-600 hover:from-slate-700 hover:to-rose-700'
            onClick={() => openInAssistant(item)}
          />
          <TopicActionButton
            icon={BookOpen}
            label='Stwórz plan nauki'
            gradientClassName='bg-gradient-to-r from-rose-500 to-fuchsia-600 hover:from-rose-600 hover:to-fuchsia-700'
            onClick={() => openInAssistant(`/planuj ${item}`)}
          />
        </span>
      ) : (
        <span className='hidden lg:inline-flex shrink-0 items-center gap-1.5 rounded-full bg-zinc-200 px-3 py-1.5 text-xs text-zinc-400 opacity-0 transition-opacity group-hover:opacity-100'>
          <Lock className='w-3.5 h-3.5' />
          <span>Tylko premium</span>
        </span>
      )}
    </li>
  )
}
