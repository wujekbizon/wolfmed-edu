'use client'

import { motion } from 'framer-motion'
import { useSparkles } from '@/hooks/useSparkles'

export default function SparklingEffect() {
  const sparkles = useSparkles(25)

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute inset-0 bg-zinc-900/60 mix-blend-multiply" />

      {sparkles.map(({ id, left, size, intensity, color, delay }) => (
        <motion.div
          key={id}
          // @ts-ignore
          className="absolute will-change-transform"
          initial={{ y: '-20vh', opacity: 0 }}
          animate={{
            y: '120vh',
            opacity: [0, intensity, intensity * 0.8, 0],
          }}
          transition={{
            y: {
              duration: 6,
              ease: 'linear',
              repeat: Infinity,
              delay,
              repeatDelay: 0,
            },
            opacity: {
              duration: 6,
              ease: 'linear',
              repeat: Infinity,
              delay,
              repeatDelay: 0,
            },
          }}
          style={{
            left: `${left}%`,
            width: `${size * 3}px`,
            height: `${size * 3}px`,
          }}
        >
          {/* Main spark */}
          <div
            className="absolute inset-0 rounded-full will-change-transform"
            style={{
              background: `${color}, ${intensity})`,
              boxShadow: `
                0 0 ${size * 2}px ${color}, ${intensity * 0.8}),
                0 0 ${size * 4}px ${color}, ${intensity * 0.4})
              `,
            }}
          />

          {/* Trail effect */}
          <motion.div
            // @ts-ignore
            className="absolute will-change-transform"
            animate={{
              height: [0, size * 15],
              opacity: [0, intensity * 0.2, 0],
            }}
            transition={{
              duration: 1.5,
              ease: 'linear',
              repeat: Infinity,
              repeatDelay: 0,
            }}
            style={{
              width: '100%',
              top: '100%',
              background: `linear-gradient(to bottom, 
                ${color}, ${intensity}) 0%,
                ${color}, 0) 100%
              )`,
              filter: 'blur(1px)',
              transform: 'translateY(-100%)',
            }}
          />
        </motion.div>
      ))}
    </div>
  )
}
