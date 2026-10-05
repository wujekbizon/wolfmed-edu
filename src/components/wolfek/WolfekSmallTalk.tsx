'use client'

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { WOLFEK_SMALL_TALK } from '@/constants/wolfekMessages'
import type { WolfekSmallTalkProps } from '@/types/wolfekTypes'

export default function WolfekSmallTalk({ index }: WolfekSmallTalkProps) {
  const reduced = useReducedMotion()

  return <div className="wolfek-small-talk speech-bubble">
    <AnimatePresence initial={false} mode="wait">
      <motion.p key={index} initial={{ opacity: reduced ? 1 : 0 }} animate={{ opacity: 1 }}
        exit={{ opacity: reduced ? 1 : 0 }} transition={{ duration: reduced ? 0 : .18 }}>
        {WOLFEK_SMALL_TALK[index]}
      </motion.p>
    </AnimatePresence>
  </div>
}
