'use client'

import { useState } from 'react'
import TabNavigation from '@/components/ui/TabNavigation'
import TabPanel from '@/components/ui/TabPanel'
import { NAUKA_LIBRARY_TABS } from '@/constants/naukaTabs'
import type { NaukaLibraryProps } from '@/types/naukaLayoutTypes'

export default function NaukaLibrary({ isPremium, ...sections }: NaukaLibraryProps) {
  const [active, setActive] = useState('notes')
  const options = isPremium ? NAUKA_LIBRARY_TABS : NAUKA_LIBRARY_TABS.slice(0, 3)

  return (
    <div className='space-y-4'>
      <div className='sm:max-w-lg'>
        <TabNavigation id='nauka-library' label='Rodzaj materiałów' options={options} active={active} onChange={setActive} variant='underline' />
      </div>
      {options.map(({ id }) => (
        <TabPanel key={id} id='nauka-library' tabId={id} active={active === id}>
          {sections[id]}
        </TabPanel>
      ))}
    </div>
  )
}
