'use client'

import { motion } from 'framer-motion'
import { driftingAnimation, floatingAnimation, longDriftAnimation } from '@/animations/motion'

interface ShapeProps {
  width: number
  height: number
  left: string
  top: string
  duration: number
  index: number
  color: string
}

export function Shape({ width, height, left, top, duration, index, color }: ShapeProps) {
  return (
    <motion.div
      // @ts-ignore
      className={`absolute rounded-full backdrop-blur-sm border border-black/25 ${color}`}
      style={{
        width,
        height,
        left,
        top,
        boxShadow: '0 0 15px rgba(0,0,0,0.10)'
      }}
     
      animate={longDriftAnimation(
        200,   // max drift horizontally
        200,   // max drift vertically
        15,    // subtle rotation
        0.03, // small breathing
        duration // <- will be around 10–20s per shape
      ) as any}
    />
  )
}
