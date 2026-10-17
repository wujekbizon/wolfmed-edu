'use client'

import { motion } from 'framer-motion'
import type { Wolfek3DGlassesProps } from '@/types/wolfekTypes'

export default function Wolfek3DGlasses({ reduced }: Wolfek3DGlassesProps) {
  return <motion.g initial={reduced ? false : { opacity: 0, y: -8, scale: 1.04 }}
    animate={reduced ? { opacity: 1 } : { opacity: 1, y: [-8, 2, 0], scale: [1.04, .99, 1] }}
    exit={reduced ? { opacity: 0 } : { opacity: 0, y: -5, transition: { duration: .16 } }}
    transition={{ duration: reduced ? 0 : .4, ease: 'easeOut' }}
    style={{ transformOrigin: '60px 57px' }} aria-hidden="true">
    <path d="M29 48L19 43Q16 41 13 44M91 48L101 43Q104 41 107 44"
      stroke="#453a50" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M29 46L19 41M91 46L101 41"
      stroke="#9e91ad" strokeWidth="2.5" strokeLinecap="round" />
    <rect x="28" y="47" width="27" height="21" rx="4" fill="none"
      stroke="#453a50" strokeWidth="5" />
    <rect x="65" y="47" width="27" height="21" rx="4" fill="none"
      stroke="#453a50" strokeWidth="5" />
    <rect x="28" y="45" width="27" height="21" rx="4" fill="#94d3ec"
      fillOpacity=".58" stroke="#73677e" strokeWidth="3.8" />
    <rect x="65" y="45" width="27" height="21" rx="4" fill="#f3a4b8"
      fillOpacity=".58" stroke="#73677e" strokeWidth="3.8" />
    <path d="M56 50Q60 47 64 50" stroke="#453a50" strokeWidth="5" strokeLinecap="round" />
    <path d="M56 48Q60 45 64 48" stroke="#a497b0" strokeWidth="2.5" strokeLinecap="round" />
    <path d="M31 48h7l-6 15h-2Zm37 0h7l-6 15h-2Z" fill="#fff" fillOpacity=".22" />
    <path d="M31 44h20M69 44h20" stroke="#d5cadc" strokeWidth="1.2" strokeLinecap="round" />
  </motion.g>
}
