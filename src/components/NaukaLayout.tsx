'use client'

import TabNavigation from '@/components/ui/TabNavigation'
import TabPanel from '@/components/ui/TabPanel'
import { NAUKA_TABS } from '@/constants/naukaTabs'
import { useNaukaNavigation } from '@/hooks/useNaukaNavigation'
import type { NaukaLayoutProps } from '@/types/naukaLayoutTypes'

export default function NaukaLayout({ categories, workspace, library }: NaukaLayoutProps) {
  const { active, selectTab, anchorRef } = useNaukaNavigation()

  return (
    <>
      <div ref={anchorRef} />
      <div className='sticky top-0 z-20 -mx-4 mb-5 bg-zinc-50/95 px-4 py-3 backdrop-blur-xl sm:mb-6 lg:-mx-10 lg:px-10'>
        <div className='w-full sm:max-w-lg'>
          <TabNavigation id='nauka' label='Centrum nauki' options={NAUKA_TABS} active={active} onChange={selectTab} />
        </div>
      </div>
      <TabPanel id='nauka' tabId='categories' active={active === 'categories'}>{categories}</TabPanel>
      <TabPanel id='nauka' tabId='workspace' active={active === 'workspace'}>
        <div className='mb-5'>
          <h2 className='text-xl font-bold text-zinc-800'>Pracownia AI</h2>
          <p className='mt-1 text-sm text-zinc-500'>Ucz się z AI — twórz notatki, testy, fiszki i mapy myśli.</p>
        </div>
        {workspace}
      </TabPanel>
      <TabPanel id='nauka' tabId='library' active={active === 'library'}>{library}</TabPanel>
    </>
  )
}
