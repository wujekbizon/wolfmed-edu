'use client'

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import TabNavigation from '@/components/ui/TabNavigation'
import TabPanel from '@/components/ui/TabPanel'
import NaukaLibrary from '@/components/NaukaLibrary'
import NaukaWolfekWelcome from '@/components/wolfek/NaukaWolfekWelcome'
import { CellEditorsMountContext } from '@/context/CellEditorsMountContext'
import { NAUKA_TABS, NAUKA_LIBRARY_TABS } from '@/constants/naukaTabs'
import { useNaukaNavigation } from '@/hooks/useNaukaNavigation'
import type { NaukaLayoutProps, NaukaTab } from '@/types/naukaLayoutTypes'

export default function NaukaLayout({ categories, workspace, library }: NaukaLayoutProps) {
  const { active, workspaceOpened, libraryTab, selectLibraryTab, selectTab, anchorRef } = useNaukaNavigation(library.isPremium)
  const reducedMotion = useReducedMotion()
  const libraryOptions = library.isPremium ? NAUKA_LIBRARY_TABS : NAUKA_LIBRARY_TABS.slice(0, 3)

  const navigateFromWolfek = (tab: NaukaTab) => {
    selectTab(tab)
    requestAnimationFrame(() => {
      document.getElementById(`nauka-tab-${tab}`)?.focus({ preventScroll: true })
      anchorRef.current?.scrollIntoView({ block: 'start', behavior: reducedMotion ? 'instant' : 'smooth' })
    })
  }

  return (
    <>
      <h1 className='mb-4 text-2xl font-bold tracking-tight text-zinc-800 sm:text-3xl'>Centrum Nauki</h1>
      <NaukaWolfekWelcome onNavigate={navigateFromWolfek} />
      <div ref={anchorRef} />
      <div className='mb-5 bg-transparent py-3 sm:mb-6'>
        <div className='w-full sm:max-w-lg'>
          <TabNavigation id='nauka' label='Centrum nauki' options={NAUKA_TABS} active={active} onChange={selectTab} />
          <AnimatePresence initial={false}>
          {active === 'library' && (
            <motion.div
              key='library-navigation'
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: reducedMotion ? 0 : .22, ease: [.22, 1, .36, 1] }}
              className='-mx-1 overflow-hidden px-1'
            >
            <div className="lg:relative lg:ml-auto lg:mt-2.5 lg:w-[28rem] lg:max-w-full lg:rounded-xl lg:border lg:border-rose-200/70 lg:bg-rose-50/30 lg:px-2 lg:pb-1 lg:before:absolute lg:before:-top-2.5 lg:before:right-[18%] lg:before:h-2.5 lg:before:w-px lg:before:bg-rose-300 lg:before:content-['']">
              <TabNavigation id='nauka-library' label='Rodzaj materiałów' options={libraryOptions} active={libraryTab} onChange={selectLibraryTab} variant='underline' />
            </div>
            </motion.div>
          )}
          </AnimatePresence>
        </div>
      </div>
      <TabPanel id='nauka' tabId='categories' active={active === 'categories'}>{categories}</TabPanel>
      <TabPanel id='nauka' tabId='workspace' active={active === 'workspace'}>
        <CellEditorsMountContext.Provider value={workspaceOpened}>
          {workspace}
        </CellEditorsMountContext.Provider>
      </TabPanel>
      <TabPanel id='nauka' tabId='library' active={active === 'library'}>
        <NaukaLibrary {...library} active={libraryTab} />
      </TabPanel>
    </>
  )
}
