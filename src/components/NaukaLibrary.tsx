'use client'

import TabPanel from '@/components/ui/TabPanel'
import { NAUKA_LIBRARY_TABS } from '@/constants/naukaTabs'
import type { NaukaLibraryProps } from '@/types/naukaLayoutTypes'

export default function NaukaLibrary({ isPremium, active, ...sections }: NaukaLibraryProps) {
  const options = isPremium ? NAUKA_LIBRARY_TABS : NAUKA_LIBRARY_TABS.slice(0, 3)

  return (
    <div className='space-y-4'>
      {options.map(({ id }) => (
        <TabPanel key={id} id='nauka-library' tabId={id} active={active === id}>
          {sections[id]}
        </TabPanel>
      ))}
    </div>
  )
}
