'use client'

import { motion } from 'framer-motion'
import { useFloatingShapes } from '@/hooks/useFloatingShapes'
import { staggerContainer } from '@/animations/motion'
import { Shape } from './Shape'

export function FloatingShapes({ count }: { count?: number }) {
  const floatingShapes = useFloatingShapes({ count })

  return (
    <motion.div
      //@ts-ignore
      className="absolute w-full h-full pointer-events-none"
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
    >
      {floatingShapes.map((shape, i) => (
        <Shape
          key={i}
          index={i}
          width={shape.width}
          height={shape.height}
          left={shape.left}
          top={shape.top}
          color={shape.color ?? 'bg-white'} // Default to white if no color is provided
          duration={shape.duration}
        />
      ))}
    </motion.div>
  )
}
