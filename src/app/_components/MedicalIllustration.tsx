'use client'
import { motion } from 'framer-motion'
import { iconPaths, iconPositions } from '@/constants/illustrationContent'

export const MedicalIllustration = () => {
  return (
    <motion.div
      // @ts-ignore
      className="relative w-full max-w-[300px] md:max-w-[600px] aspect-square mx-auto md:mx-0 px-4 md:px-0"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: 'easeInOut' }}
    >
      {/* Main circle background */}
      <motion.div
        // @ts-ignore
        className="absolute inset-[5%] md:inset-0 rounded-full bg-linear-to-tr from-[#ff5b5b]/20 to-purple-500/10"
        initial={{ opacity: 0 }}
        animate={{
          opacity: 1,
          scale: [1, 1.05, 1],
          rotate: [0, 5, -5, 0],
          background: [
            'linear-gradient(135deg, rgba(255,91,91,0.2) 0%, rgba(147,51,234,0.1) 100%)',
            'linear-gradient(225deg, rgba(255,91,91,0.2) 0%, rgba(147,51,234,0.1) 100%)',
            'linear-gradient(135deg, rgba(255,91,91,0.2) 0%, rgba(147,51,234,0.1) 100%)',
          ],
        }}
        transition={{
          opacity: { duration: 0.3 },
          duration: 8,
          repeat: Infinity,
          repeatType: 'reverse',
          ease: 'easeInOut',
        }}
      />

      {/* Medical Cross SVG */}
      <motion.svg
        // @ts-ignore
        className="absolute left-1/2 right-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 sm:w-16 sm:h-16 md:w-32 md:h-32"
        viewBox="0 0 24 24"
        initial={{ scale: 0 }}
        animate={{
          scale: 1,
          rotate: [0, 360],
          y: [0, -100, 0],
        }}
        transition={{
          scale: { duration: 0.3, type: 'spring', stiffness: 200 },
          y: {
            duration: 10,
            repeat: Infinity,
            repeatType: 'reverse',
            ease: 'easeInOut',
          },
          rotate: { duration: 20, repeat: Infinity, ease: 'linear' },
        }}
      >
        <motion.circle
          cx="12"
          cy="12"
          r="10"
          stroke="#ff5b5b"
          strokeWidth="2"
          fill="none"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1, ease: 'easeInOut' }}
        />
        <motion.path
          d="M12 7v10M7 12h10"
          stroke="#ff5b5b"
          strokeWidth="2"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        />
      </motion.svg>

      {/* Pulse effect */}
      <motion.div
        // @ts-ignore
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[#ff5b5b] w-12 h-12 sm:w-16 sm:h-16 md:w-32 md:h-32"
        initial={{ opacity: 0 }}
        animate={{
          opacity: [0.5, 0, 0.5],
          scale: [1, 1.2, 1],
          y: [0, -100, 0],
        }}
        transition={{
          opacity: { duration: 0.3 },
          y: {
            duration: 10,
            repeat: Infinity,
            repeatType: 'reverse',
            ease: 'easeInOut',
          },
          scale: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
        }}
      />

      {/* Floating Medical Icons */}
      {iconPositions.map((pos, i) => (
        <motion.div
          key={i}
          // @ts-ignore
          className="absolute -translate-x-1/2 -translate-y-1/2"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            duration: 0.3,
            delay: i * 0.05,
            ease: 'easeOut',
          }}
          style={{ top: pos.top, left: pos.left }}
        >
          <motion.div
            // @ts-ignore
            className="bg-white rounded-full shadow-lg flex items-center justify-center transform-gpu w-6 h-6 sm:w-8 sm:h-8 md:w-12 md:h-12"
            animate={{
              y: [-5, 5],
              rotate: [0, 360],
            }}
            transition={{
              y: {
                duration: 2 + i * 0.3,
                repeat: Infinity,
                repeatType: 'reverse',
                ease: 'easeInOut',
              },
              rotate: {
                duration: 25,
                repeat: Infinity,
                ease: 'linear',
              },
            }}
          >
            <svg
              className="w-4 h-4 sm:w-5 sm:h-5 md:w-8 md:h-8"
              viewBox="0 0 24 24"
              fill={i % 2 === 0 ? '#ff5b5b' : '#9333ea'}
            >
              <path d={iconPaths[i]} />
            </svg>
          </motion.div>
        </motion.div>
      ))}
    </motion.div>
  )
}
