'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import type { WolfekFaceProps } from '@/types/wolfekTypes'
import WolfekEyes from './WolfekEyes'
import WolfekMonocle from './WolfekMonocle'
import Wolfek3DGlasses from './Wolfek3DGlasses'
import WolfekMouth from './WolfekMouth'

export default function WolfekFace({ id, positive, supportive, reduced, interactive, gaze, videoHover }: WolfekFaceProps) {
  const [dropped, setDropped] = useState(false)
  const leftFold = dropped ? -14 : supportive ? -5 : 0
  const rightFold = dropped ? 3 : supportive ? 5 : 0

  useEffect(() => {
    if (!dropped) return
    const timeout = setTimeout(() => setDropped(false), 2200)
    return () => clearTimeout(timeout)
  }, [dropped])

  return <svg viewBox="0 0 120 120" fill="none" className="wolfek-face">
    <defs>
      <linearGradient id={`${id}-fur`} x1="20" y1="20" x2="95" y2="110" gradientUnits="userSpaceOnUse">
        <stop stopColor="#e4dcec" /><stop offset=".52" stopColor="#b7a5cc" /><stop offset="1" stopColor="#9781af" />
      </linearGradient>
      <linearGradient id={`${id}-muzzle`} x1="40" y1="60" x2="70" y2="115" gradientUnits="userSpaceOnUse">
        <stop stopColor="#fffdfb" /><stop offset="1" stopColor="#eee8f1" />
      </linearGradient>
    </defs>
    <motion.g className="wolfek-ear wolfek-ear-left"
      animate={reduced ? { rotate: leftFold } : { rotate: [leftFold, leftFold, leftFold - 7, leftFold + 2, leftFold] }}
      transition={{ duration: 8.5, repeat: Infinity, times: [0, .57, .63, .7, 1], ease: 'easeInOut' }}>
      <path d="M22 46Q18 25 27 8q12 7 23 25Z" fill="#d9cde5" />
      <path d="M26 39q-3-14 3-23l15 18Z" fill="#9984ae" />
      <path d="m28 34 2-12 10 12-7-2-5 8Z" fill="#dfb5c9" />
    </motion.g>
    <motion.g className="wolfek-ear wolfek-ear-right"
      animate={reduced ? { rotate: rightFold } : { rotate: [rightFold, rightFold, rightFold + 6, rightFold - 2, rightFold] }}
      transition={{ duration: 10.5, repeat: Infinity, times: [0, .31, .37, .44, 1], ease: 'easeInOut' }}>
      <path d="M98 46q4-21-5-38-12 7-23 25Z" fill="#cbbbdc" />
      <path d="M94 39q3-14-3-23L76 34Z" fill="#8f79a6" />
      <path d="m92 34-2-12-10 12 7-2 5 8Z" fill="#dfb5c9" />
    </motion.g>
    <path d="M22 43Q34 29 60 30q26-1 38 13l12 20-11-4 9 19-12-6 2 19-10-7q-5 16-18 20l-10 9-10-9Q37 100 32 84L22 91l2-19-12 6 9-19-11 4Z"
      fill={`url(#${id}-fur)`} />
    <path d="M20 61q9-16 26-13L33 59l-13 9 10-1-7 13 16-9 10-16 11-7Q37 36 20 61Z" fill="#aa95c2" />
    <path d="M100 61Q91 45 74 48l13 11 13 9-10-1 7 13-16-9-10-16-11-7q23-12 40 13Z" fill="#9c86b5" />
    <path d="M35 38q25-13 50 0-16-2-25 11-9-13-25-11Z" fill="#dcd1e9" />
    <path d="M29 73q12 5 23-7h16q11 12 23 7l-9 18-5-7-7 18-10 9-10-9-7-18-5 7Z" fill={`url(#${id}-muzzle)`} />
    <path d="m34 76 9 8 7 18-12-11zM86 76l-9 8-7 18 12-11z" fill="#ded3e8" />
    <path d="M29 47q16-13 31 0 15-13 31 0-13-5-21 5l-3 15q15 6 12 17-4 10-19 5-15 5-19-5-3-11 12-17l-3-15Q42 42 29 47Z" fill={`url(#${id}-muzzle)`} />
    <path d="M60 48v30q9-8 13-2l-6-9-2-15Z" fill="#d8cbe4" fillOpacity=".6" />
    <motion.path d="M24 42q13-12 36-10 23-2 36 10-18-9-36-7-18-2-36 7Z" fill="#fff"
      animate={reduced ? { opacity: .32 } : { opacity: [.27, .4, .27] }}
      transition={{ duration: 8.4, repeat: Infinity, ease: 'easeInOut', delay: 1.1 }} />
    <WolfekEyes positive={positive} confused={dropped} gaze={gaze} videoHover={Boolean(videoHover)} reduced={reduced} />
    <path d="M52 77q8-4 16 0-1 7-8 8-7-1-8-8Z" fill="#8e708f" />
    <path d="M56 77q4-2 8 0" stroke="#cdb5cf" strokeWidth="1.5" strokeLinecap="round" />
    <WolfekMouth dropped={dropped} reduced={reduced} />
    <path d="m54 98 6 4 6-4-6 11z" fill="#b7a3c9" />
    <ellipse cx="36" cy="71" rx="4" ry="2" fill="#e6b1c5" fillOpacity=".65" />
    <ellipse cx="84" cy="71" rx="4" ry="2" fill="#e6b1c5" fillOpacity=".65" />
    {!videoHover && <WolfekMonocle dropped={dropped} reduced={reduced} interactive={interactive} onDrop={() => setDropped(true)} />}
    <AnimatePresence initial={false}>
      {videoHover && <Wolfek3DGlasses reduced={reduced} />}
    </AnimatePresence>
  </svg>
}
