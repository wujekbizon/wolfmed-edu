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

// The action row is revealed on hover only where hovering exists. Tailwind wraps
// every group-hover rule in @media (hover: hover), so on touch the base state is
// what ships — visible actions — and no width breakpoint has to guess at it.
const REVEAL =
  'transition-opacity duration-200 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto group-focus-within:opacity-100 group-focus-within:pointer-events-auto'

export default function ProgramTopicItem({ item, isPremium = false }: ProgramTopicItemProps) {
  const router = useRouter()
  const setPendingTopic = useRagStore((state) => state.setPendingTopic)

  const openInAssistant = (topic: string) => {
    setPendingTopic(topic)
    router.push('/panel/nauka')
  }

  return (
    <li className='h-full'>
      <div className='group h-full flex flex-col p-3 bg-zinc-50 rounded-lg border border-zinc-200 hover:bg-white hover:border-zinc-300 transition-colors'>
        <p className='flex-1 text-sm leading-relaxed text-gray-700 break-words'>{item}</p>

        {isPremium ? (
          <div className={`mt-3 flex items-center justify-end gap-2 ${REVEAL}`}>
            <TopicActionButton
              icon={Sparkles}
              label='Wyjaśnij'
              fullLabel='Wyjaśnij z AI'
              colorClassName='bg-zinc-700 text-white border border-zinc-800 shadow-sm hover:bg-zinc-800 hover:shadow-md'
              onClick={() => openInAssistant(item)}
            />
            <TopicActionButton
              icon={BookOpen}
              label='Plan nauki'
              fullLabel='Stwórz plan nauki'
              colorClassName='bg-zinc-100 text-zinc-700 border border-zinc-300 shadow-sm hover:bg-zinc-200 hover:shadow-md'
              onClick={() => openInAssistant(`/planuj ${item}`)}
            />
          </div>
        ) : (
          <div className={`mt-3 flex items-center justify-end ${REVEAL}`}>
            <span className='inline-flex items-center gap-1.5 rounded-xl bg-zinc-100 border border-zinc-300 px-3 py-2 text-xs font-medium text-zinc-500 shadow-sm'>
              <Lock className='w-3.5 h-3.5 shrink-0' />
              Tylko premium
            </span>
          </div>
        )}
      </div>
    </li>
  )
}
