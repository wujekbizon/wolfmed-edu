'use client'

import { motion, useReducedMotion } from 'framer-motion'

export default function WolfekThinkingDots() {
  const reduced = useReducedMotion()
  return <motion.span className="wolfek-thinking-dots" aria-hidden="true"
    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    transition={{ duration: reduced ? 0 : .18 }}>
    {[0, 1, 2].map((dot) => <motion.span key={dot}
      style={{ width: 6 + dot * 4, height: 6 + dot * 4, left: dot * 14, bottom: dot * 7 }}
      animate={reduced ? { opacity: .8, y: 0, scale: 1 }
        : { opacity: [.35, 1, .35], y: [1, -3, 1], scale: [.85, 1.08, .85] }}
      transition={reduced ? { duration: 0 } : { duration: 1.35, delay: dot * .18, repeat: Infinity, ease: 'easeInOut' }} />)}
  </motion.span>
}
