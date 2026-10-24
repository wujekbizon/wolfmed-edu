'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Play } from 'lucide-react'
import Button from '@/components/ui/Button'
import TabNavigation from '@/components/ui/TabNavigation'
import TabPanel from '@/components/ui/TabPanel'
import PracticalBriefHeader from '@/components/PracticalBriefHeader'
import PracticalBriefHelp from '@/components/PracticalBriefHelp'
import PracticalBriefPatient from '@/components/PracticalBriefPatient'
import PracticalBriefScope from '@/components/PracticalBriefScope'
import { PRACTICAL_BRIEF_TABS } from '@/constants/practicalBrief'
import type { PracticalBriefProps } from '@/types/practicalBriefTypes'

export default function ExamArkuszBrief({ exam, onStart }: PracticalBriefProps) {
  const [active, setActive] = useState('task')

  return (
    <section className='practical-exam-brief min-w-0 w-full bg-linear-to-br from-zinc-50/80 via-rose-50/30 to-zinc-50/80 px-4 pb-6 lg:px-10'>
      <div className='mx-auto flex w-full max-w-7xl flex-col gap-6'>
        <Link href='/panel/egzaminy' className='inline-flex min-h-11 w-fit items-center gap-2 text-sm text-zinc-500 hover:text-zinc-800 focus-visible:outline-2 focus-visible:outline-rose-400'>
          <ArrowLeft size={16} />Wróć do listy arkuszy
        </Link>
        <PracticalBriefHeader exam={exam} />
        <PracticalBriefHelp exam={exam} activeTab={active} onNavigate={setActive} />
        <div className='w-full sm:max-w-xl'>
          <TabNavigation id='practical-brief' label='Przygotowanie do egzaminu' options={PRACTICAL_BRIEF_TABS} active={active} onChange={setActive} />
        </div>
        <div className='min-w-0'>
          <TabPanel id='practical-brief' tabId='task' active={active === 'task'}>
            <div className='rounded-2xl border border-zinc-200 bg-white p-5 sm:p-7'>
              <h2 className='mb-3 text-lg font-bold text-zinc-900'>Zadanie egzaminacyjne</h2>
              <p className='max-w-4xl whitespace-pre-line text-sm leading-relaxed text-zinc-700 sm:text-base'>{exam.taskSummary}</p>
            </div>
          </TabPanel>
          <TabPanel id='practical-brief' tabId='patient' active={active === 'patient'}>
            <PracticalBriefPatient exam={exam} />
          </TabPanel>
          <TabPanel id='practical-brief' tabId='scope' active={active === 'scope'}>
            <PracticalBriefScope exam={exam} />
          </TabPanel>
        </div>
        <div className='sticky bottom-0 z-30 -mx-4 border-t border-rose-100 bg-white/95 px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] backdrop-blur-sm lg:static lg:mx-0 lg:rounded-2xl lg:border lg:p-4'>
          <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
            <p className='hidden text-sm text-zinc-500 sm:block'>Czas rozpocznie się po wybraniu przycisku.</p>
            <Button variant='coral' size='lg' onClick={onStart} className='w-full whitespace-normal text-sm sm:w-auto'>
              <Play size={18} className='shrink-0' />Rozpocznij egzamin
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
