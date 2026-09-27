'use client'

import { motion } from 'framer-motion'
import type { WolfekEyesProps } from '@/types/wolfekTypes'

export default function WolfekEyes({ positive, confused, gaze }: WolfekEyesProps) {
  return <g>
    {confused && <path d="M35 45q7-5 14-1m23 4 12 2" stroke="#8d759f" strokeWidth="2" strokeLinecap="round" />}
    <g className={confused ? undefined : 'wolfek-eyes'}>
      {positive && !confused
        ? <path d="M36 59q6-9 12 0m24 0q6-9 12 0" stroke="#655374" strokeWidth="3" strokeLinecap="round" />
        : <>
          <ellipse cx="42" cy="57" rx="7" ry={confused ? 9 : 7.5} fill="#fffdfb" />
          <ellipse cx="78" cy="57" rx="7" ry={confused ? 6 : 7.5} fill="#fffdfb" />
          <motion.g style={{ x: confused ? 0 : gaze?.x ?? 0, y: confused ? 0 : gaze?.y ?? 0 }}>
            <ellipse cx={confused ? 45 : 43} cy={confused ? 60 : 57.5} rx="3.3" ry="4.5" fill="#655374" />
            <ellipse cx={confused ? 80 : 77} cy={confused ? 59 : 57.5} rx="3.3" ry="4.5" fill="#655374" />
            <circle cx={confused ? 46 : 44} cy={confused ? 58 : 56} r="1.3" fill="#fff" />
            <circle cx={confused ? 81 : 78} cy={confused ? 57 : 56} r="1.3" fill="#fff" />
          </motion.g>
        </>}
    </g>
  </g>
}
