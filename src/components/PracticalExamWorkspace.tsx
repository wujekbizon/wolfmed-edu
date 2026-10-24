'use client'

import { useRef, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Info } from 'lucide-react'
import Button from '@/components/ui/Button'
import PracticalExamTimer from '@/components/PracticalExamTimer'
import PracticalExamNavigation from '@/components/PracticalExamNavigation'
import PracticalExamSections from '@/components/PracticalExamSections'
import PracticalExamFooter from '@/components/PracticalExamFooter'
import PracticalExamCase from '@/components/PracticalExamCase'
import PracticalExamCaseDialog from '@/components/PracticalExamCaseDialog'
import type { PracticalExamWorkspaceProps } from '@/types/practicalExamWorkspaceTypes'

export default function PracticalExamWorkspace({ exam, session }: PracticalExamWorkspaceProps) {
  const [active, setActive] = useState(0)
  const [infoOpen, setInfoOpen] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)
  const scroll = useRef<HTMLDivElement>(null)
  const total = exam.assessedTasks.length + exam.forms.length
  const selectSection = (index: number) => {
    setActive(index)
    scroll.current?.scrollTo({ top: 0 })
  }
  return (
    <section className='-my-10 flex h-[calc(100dvh-5rem)] min-w-0 w-full flex-col overflow-hidden bg-linear-to-br from-zinc-50 via-rose-50/30 to-zinc-50'>
      <header className='flex shrink-0 items-center justify-between gap-3 border-b border-zinc-200 bg-white px-4 py-3 lg:px-6'>
        <Link href='/panel/egzaminy' className='inline-flex min-h-11 shrink-0 items-center gap-2 text-sm text-zinc-500 hover:text-zinc-800'><ArrowLeft size={16} />Przerwij</Link>
        <h1 className='hidden min-w-0 truncate text-sm font-semibold text-zinc-800 sm:block'>{exam.title}</h1>
        <div className='flex shrink-0 items-center gap-2'>
          <Button variant='secondary' onClick={() => setInfoOpen(true)} className='min-h-11 text-xs xl:hidden' aria-label='Pacjent i polecenie'><Info size={16} />Szczegóły</Button>
          <PracticalExamTimer durationMinutes={exam.durationMinutes} startTime={session.startTime} isSubmitting={session.isPending} onTimeUp={() => formRef.current?.requestSubmit()} />
        </div>
      </header>
      <PracticalExamNavigation exam={exam} active={active} onSelect={selectSection} />
      <div className='flex min-h-0 flex-1 overflow-hidden'>
        <div ref={scroll} className='scrollbar-webkit min-w-0 flex-1 overflow-y-auto overscroll-contain px-3 py-4 sm:p-6'>
          <PracticalExamSections exam={exam} session={session} active={active} formRef={formRef} />
        </div>
        <aside className='scrollbar-webkit hidden w-80 shrink-0 overflow-y-auto border-l border-zinc-200 bg-white/90 xl:block 2xl:w-96'>
          {!infoOpen && <PracticalExamCase exam={exam} />}
        </aside>
      </div>
      <PracticalExamFooter active={active} total={total} pending={session.isPending} onSelect={selectSection} />
      {infoOpen && <PracticalExamCaseDialog exam={exam} onClose={() => setInfoOpen(false)} />}
    </section>
  )
}
