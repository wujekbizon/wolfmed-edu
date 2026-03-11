'use client'

import dynamic from 'next/dynamic'
import { motion } from 'framer-motion'

// ssr: false — Framer Motion SVG motion.* elements inject CSS transform styles
// on the client that are absent in SSR, causing hydration mismatches.
// The cell is purely decorative so skipping SSR is correct here.
const HumanCellSVG = dynamic(
  () => import('@/components/HumanCellSVG').then((m) => ({ default: m.HumanCellSVG })),
  { ssr: false }
)

export const MedicalIllustration = () => {
  return (
    <motion.div
      className="relative w-[260px] sm:w-[340px] lg:w-[440px] xl:w-[500px] aspect-square rounded-full"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{
        opacity: 1,
        scale: 1,
        filter: [
          'drop-shadow(0 0 18px rgba(255, 130, 80, 0.2))',
          'drop-shadow(0 0 40px rgba(255, 130, 80, 0.45))',
          'drop-shadow(0 0 18px rgba(255, 130, 80, 0.2))',
        ],
      }}
      transition={{
        opacity: { duration: 0.6, delay: 0.7, ease: 'easeInOut' },
        scale: { duration: 0.6, delay: 0.7, ease: 'easeInOut' },
        filter: { duration: 8, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' },
      }}
    >
      <motion.div
        className="relative w-full h-full flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{
          opacity: 1,
          scale: [1, 1.1, 1],
          rotate: [0, 2, -2, 0],
        }}
        transition={{
          opacity: { duration: 0.4, delay: 0.7 },
          duration: 8,
          repeat: Infinity,
          repeatType: 'reverse',
          ease: 'easeInOut',
        }}
      >
        <HumanCellSVG
          id="cell"
          type="cell"
          position={{ x: 0, y: 0 }}
          size={{ width: 100, height: 100 }}
          velocity={{ x: 0, y: 0 }}
          radius={50}
          color="rgb(198, 223, 247)"
        />
      </motion.div>
    </motion.div>
  )
}
