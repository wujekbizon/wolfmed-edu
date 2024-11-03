'use client'

import { motion } from 'framer-motion'
import { gradientAnimation } from '@/animations/motion'
import { gradientConfig } from '@/animations/gradientConfig'

export default function GradientOverlay() {
  return (
    <>
      {/* Base gradient layer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={gradientAnimation}
        // @ts-ignore
        className="absolute inset-0 bg-gradient-to-r from-[#ff5b5b]/10 via-purple-500/5 to-transparent"
      />

      {/* Animated radial gradient overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{
          opacity: [0, 1],
          background: gradientConfig.backgroundStates,
        }}
        transition={gradientConfig.transition}
        // @ts-ignore
        className="absolute inset-0"
      />
    </>
  )
}
