'use client'

import { useState } from 'react'
import TabNavigation from '@/components/ui/TabNavigation'
import TabPanel from '@/components/ui/TabPanel'
import ExamWolfekWelcome from '@/components/wolfek/ExamWolfekWelcome'
import type { ExamHubLayoutProps } from '@/types/examHubTypes'
import { EXAM_HUB_TABS } from '@/constants/examHubTabs'

export default function ExamHubLayout({ theory, practice }: ExamHubLayoutProps) {
  const [active, setActive] = useState('theory')

  return (
    <section className='min-w-0 w-full bg-linear-to-br from-zinc-50/80 via-rose-50/30 to-zinc-50/80 px-4 pb-10 lg:px-10'>
      <div className='mx-auto w-full max-w-7xl'>
        <h1 className='mb-4 text-2xl font-bold tracking-tight text-zinc-800 sm:text-3xl'>Testy i egzaminy</h1>
        <ExamWolfekWelcome active={active} />
        <div className='my-5 w-full sm:my-6 sm:max-w-lg'>
          <TabNavigation id='exam-hub' label='Rodzaj egzaminu' options={EXAM_HUB_TABS} active={active} onChange={setActive} />
        </div>
        <TabPanel id='exam-hub' tabId='theory' active={active === 'theory'}>{theory}</TabPanel>
        <TabPanel id='exam-hub' tabId='practice' active={active === 'practice'}>{practice}</TabPanel>
      </div>
    </section>
  )
}
