'use client'

import { useState } from 'react'
import TabNavigation from '@/components/ui/TabNavigation'
import TabPanel from '@/components/ui/TabPanel'
import ExamWolfekWelcome from '@/components/wolfek/ExamWolfekWelcome'
import ProceduresHubEmpty from '@/components/ProceduresHubEmpty'
import type { ProceduresHubLayoutProps } from '@/types/procedureHubTypes'

export default function ProceduresHubLayout({ panels }: ProceduresHubLayoutProps) {
  const [selected, setSelected] = useState(panels[0]?.id ?? '')
  const active = panels.some(panel => panel.id === selected) ? selected : panels[0]?.id ?? ''
  const multiple = panels.length > 1

  return (
    <section className='min-w-0 w-full bg-linear-to-br from-zinc-50/80 via-rose-50/30 to-zinc-50/80 px-4 pb-10 lg:px-10'>
      <div className='mx-auto w-full max-w-7xl'>
        <h1 className='mb-4 text-2xl font-bold tracking-tight text-zinc-800 sm:text-3xl'>Procedury medyczne</h1>
        <ExamWolfekWelcome active={active} variant='procedures' reviewTargetId={multiple ? `procedures-hub-tab-${active}` : 'procedures-hub-content'} />
        {multiple && (
          <div className='my-5 w-full sm:my-6 sm:max-w-lg'>
            <TabNavigation id='procedures-hub' label='Kurs procedur' options={panels} active={active} onChange={setSelected} />
          </div>
        )}
        <div id='procedures-hub-content' className={multiple ? undefined : 'mt-6'}>
          {panels.length === 0 && <ProceduresHubEmpty />}
          {panels.map(panel => multiple ? (
            <TabPanel key={panel.id} id='procedures-hub' tabId={panel.id} active={active === panel.id}>
              {panel.content}
            </TabPanel>
          ) : <div key={panel.id}>{panel.content}</div>)}
        </div>
      </div>
    </section>
  )
}
