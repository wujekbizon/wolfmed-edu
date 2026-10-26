'use client'

import { useEffect, useRef, useState } from 'react'
import TabNavigation from '@/components/ui/TabNavigation'
import TabPanel from '@/components/ui/TabPanel'
import ExamResultSummary from '@/components/ExamResultSummary'
import ExamResultActions from '@/components/ExamResultActions'
import ExamResultOverview from '@/components/ExamResultOverview'
import ExamResultReview from '@/components/ExamResultReview'
import ExamResultWolfekHelp from '@/components/ExamResultWolfekHelp'
import { EXAM_RESULT_TABS } from '@/constants/practicalExamResults'
import { getExamResultSections } from '@/helpers/getExamResultSections'
import type { ExamResultsProps, ExamResultTarget } from '@/types/practicalExamResultTypes'

export default function ExamResults({ title, result, answers, onRestart }: ExamResultsProps) {
  const [active, setActive] = useState('summary')
  const [procedureId, setProcedureId] = useState(String(result.procedures[0]?.taskIndex ?? ''))
  const [formId, setFormId] = useState(result.forms[0]?.formId ?? '')
  const heading = useRef<HTMLHeadingElement>(null)
  const sections = getExamResultSections(result)
  const tabs = EXAM_RESULT_TABS.filter((tab) => tab.id === 'summary' || (tab.id === 'procedures' ? result.procedures.length > 0 : result.forms.length > 0))

  useEffect(() => {
    heading.current?.focus({ preventScroll: true })
    heading.current?.scrollIntoView({ block: 'start' })
  }, [])

  const review = (target: ExamResultTarget) => {
    if (target.tab === 'procedures') setProcedureId(target.id)
    if (target.tab === 'forms') setFormId(target.id)
    setActive(target.tab)
    requestAnimationFrame(() => {
      const panel = document.getElementById(`exam-results-panel-${target.tab}`)
      panel?.scrollIntoView({ block: 'start' })
      panel?.focus({ preventScroll: true })
    })
  }

  return (
    <section className='min-w-0 w-full bg-linear-to-br from-zinc-50/80 via-rose-50/30 to-zinc-50/80 px-4 pb-10 lg:px-10'>
      <div className='mx-auto flex w-full max-w-7xl flex-col gap-6'>
        <header className='border-b border-zinc-200/70 pb-4'>
          <h1 ref={heading} tabIndex={-1} className='text-2xl font-bold tracking-tight text-zinc-900 focus-visible:outline-2 focus-visible:outline-rose-400 sm:text-3xl'>Wynik egzaminu</h1>
          <p className='mt-2 text-sm text-zinc-500'>{title}</p>
        </header>
        <ExamResultSummary result={result} />
        <ExamResultActions onRestart={onRestart} />
        <ExamResultWolfekHelp result={result} activeTab={active} onReview={review} />
        <div className='w-full sm:max-w-xl'>
          <TabNavigation id='exam-results' label='Przegląd wyniku' options={tabs} active={active} onChange={setActive} />
        </div>
        <TabPanel id='exam-results' tabId='summary' active={active === 'summary'}>
          <ExamResultOverview sections={sections} onReview={review} />
        </TabPanel>
        <ExamResultReview result={result} answers={answers} active={active} procedureId={procedureId} formId={formId} onProcedureChange={setProcedureId} onFormChange={setFormId} />
        <div className='border-t border-zinc-200/70 pt-5'><ExamResultActions onRestart={onRestart} /></div>
      </div>
    </section>
  )
}
