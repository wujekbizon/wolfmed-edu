'use client'

import { motion, useReducedMotion } from 'framer-motion'

export default function LearningCheckMark() {
  const reduced = useReducedMotion()
  return <span className="learning-check-mark" aria-hidden="true">
    {!reduced && <motion.span className="learning-check-ping"
      initial={{ scale: 0.65, opacity: 0.42 }}
      animate={{ scale: 1.9, opacity: 0 }}
      transition={{ duration: 0.62, ease: 'easeOut' }} />}
    <svg viewBox="0 0 24 24" fill="none" className="learning-check-svg">
      <motion.path d="m5 12 4.5 4.5L19 7" stroke="currentColor" strokeWidth="2.6"
        strokeLinecap="round" strokeLinejoin="round"
        initial={reduced ? { pathLength: 1 } : { pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={reduced ? { duration: 0 } : { duration: 0.38, delay: 0.08, ease: 'easeOut' }} />
    </svg>
  </span>
}

