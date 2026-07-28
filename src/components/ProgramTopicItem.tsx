"use client"

import { useRouter } from 'next/navigation'
import { Sparkles, Lock, BookOpen } from 'lucide-react'
import { useRagStore } from '@/store/useRagStore'
import Card from './ui/Card'
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
      <Card className='group h-full flex flex-col p-3 sm:p-4 transition-shadow hover:shadow-md'>
        <p className='flex-1 text-sm leading-relaxed text-gray-700 break-words'>{item}</p>

        {isPremium ? (
          <div className={`mt-3 flex items-center gap-2 ${REVEAL}`}>
            <TopicActionButton
              icon={Sparkles}
              label='Wyjaśnij'
              fullLabel='Wyjaśnij z AI'
              gradientClassName='bg-gradient-to-r from-slate-600 to-rose-600 hover:from-slate-700 hover:to-rose-700'
              onClick={() => openInAssistant(item)}
            />
            <TopicActionButton
              icon={BookOpen}
              label='Plan nauki'
              fullLabel='Stwórz plan nauki'
              gradientClassName='bg-gradient-to-r from-rose-500 to-fuchsia-600 hover:from-rose-600 hover:to-fuchsia-700'
              onClick={() => openInAssistant(`/planuj ${item}`)}
            />
          </div>
        ) : (
          <div className={`mt-3 flex items-center ${REVEAL}`}>
            <span className='inline-flex items-center gap-1.5 rounded-full bg-zinc-200 px-3 py-2 text-xs font-medium text-zinc-500'>
              <Lock className='w-3.5 h-3.5 shrink-0' />
              Tylko premium
            </span>
          </div>
        )}
      </Card>
    </li>
  )
}
