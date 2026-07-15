'use client'

import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion'
import GradientOverlay from '@/components/GradientOverlay'
import { FloatingShapes } from '@/components/FloatingShapes'

export default function ScrollReactiveBackground() {
  const reduceMotion = useReducedMotion()
  const { scrollYProgress } = useScroll()

  // Parallax: layers drift at different rates as the page scrolls.
  // Ranges stay well inside the 30% overscan below so no edges are revealed.
  const shapesY = useTransform(scrollYProgress, [0, 1], ['0%', '-10%'])
  const gradientY = useTransform(scrollYProgress, [0, 1], ['0%', '6%'])
  // Ambient tint that deepens toward the middle of the page, then eases off.
  const tintOpacity = useTransform(scrollYProgress, [0, 0.45, 1], [0, 0.6, 0.2])

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <motion.div
        style={reduceMotion ? undefined : { y: gradientY }}
        className="absolute inset-x-0 -top-[30%] h-[160%]"
      >
        <GradientOverlay />
      </motion.div>

      <motion.div
        style={reduceMotion ? undefined : { y: shapesY }}
        className="absolute inset-x-0 -top-[30%] h-[160%]"
      >
        <FloatingShapes count={5} />
      </motion.div>

      <motion.div
        style={reduceMotion ? undefined : { opacity: tintOpacity }}
        className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(168,85,247,0.12),transparent_60%)]"
      />
    </div>
  )
}
