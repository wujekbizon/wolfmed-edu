'use client'

import { motion } from 'framer-motion'
import { floatingAnimation } from '@/animations/motion'

interface ShapeProps {
  width: number
  height: number
  left: string
  top: string
  duration: number
  index: number
}

export function Shape({ width, height, left, top, duration, index }: ShapeProps) {
  return (
    <motion.div
      // @ts-ignore
      className={`absolute rounded-full backdrop-blur-sm ${
        index % 3 === 0 ? 'bg-[#ff5b5b]/15' : index % 3 === 1 ? 'bg-purple-500/10' : 'bg-blue-500/10'
      }`}
      style={{
        width,
        height,
        left,
        top,
      }}
      animate={floatingAnimation}
      transition={{
        delay: index * 0.2,
        duration,
        repeat: Infinity,
        repeatType: 'reverse',
      }}
    />
  )
}
