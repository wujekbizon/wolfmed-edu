'use client'

import { useState } from 'react'
import TabNavigation from '@/components/ui/TabNavigation'
import TabPanel from '@/components/ui/TabPanel'
import { PRACTICAL_EXAM_CASE_TABS } from '@/constants/practicalExamWorkspace'
import type { PracticalExamCaseProps } from '@/types/practicalExamWorkspaceTypes'

export default function PracticalExamCase({ exam }: PracticalExamCaseProps) {
  const [active, setActive] = useState('patient')
  return (
    <div className='space-y-5 p-4 sm:p-5'>
      <TabNavigation id='practical-case' label='Szczegóły przypadku' options={PRACTICAL_EXAM_CASE_TABS} active={active} onChange={setActive} />
      <TabPanel id='practical-case' tabId='patient' active={active === 'patient'}>
        <h2 className='text-base font-bold text-zinc-900'>{exam.patient.name}</h2>
        <p className='mt-2 text-xs leading-relaxed text-zinc-500'>{[exam.patient.ward, exam.patient.pesel && `PESEL ${exam.patient.pesel}`].filter(Boolean).join(' · ')}</p>
        <p className='mt-4 whitespace-pre-line text-sm leading-7 text-zinc-600'>{exam.patient.description}</p>
      </TabPanel>
      <TabPanel id='practical-case' tabId='task' active={active === 'task'}>
        <h2 className='text-base font-bold text-zinc-900'>Zadanie egzaminacyjne</h2>
        <p className='mt-4 whitespace-pre-line text-sm leading-7 text-zinc-600'>{exam.taskSummary}</p>
      </TabPanel>
    </div>
  )
}
