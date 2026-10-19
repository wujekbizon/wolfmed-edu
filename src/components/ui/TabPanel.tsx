'use client'

import { motion, useReducedMotion } from 'framer-motion'
import type { TabPanelProps } from '@/types/tabTypes'

export default function TabPanel({ id, tabId, active, children }: TabPanelProps) {
  const reducedMotion = useReducedMotion()

  return (
    <motion.div
      id={`${id}-panel-${tabId}`}
      role='tabpanel'
      aria-labelledby={`${id}-tab-${tabId}`}
      tabIndex={0}
      hidden={!active}
      initial={false}
      animate={{ opacity: active ? 1 : 0 }}
      transition={{ duration: reducedMotion ? 0 : 0.18 }}
      className='min-w-0 focus-visible:outline-2 focus-visible:outline-rose-400'
    >
      {children}
    </motion.div>
  )
}
