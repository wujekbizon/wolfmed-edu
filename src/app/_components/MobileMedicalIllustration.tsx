'use client'
import { iconPaths, mobileIconPositions } from '@/constants/illustrationContent'
import { motion } from 'framer-motion'

export const MobileMedicalIllustration = () => {
  return (
    <motion.div
      // @ts-ignore
      className="relative w-full aspect-square max-w-[300px] "
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Animated background circles */}
      <motion.div
        // @ts-ignore
        className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#ff5b5b]/20 to-purple-500/10"
        animate={{
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          repeatType: 'reverse',
        }}
      />
      <motion.div
        // @ts-ignore
        className="absolute inset-[15%] rounded-full bg-gradient-to-bl from-purple-500/10 to-[#ff5b5b]/20"
        animate={{
          scale: [1.1, 1, 1.1],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          repeatType: 'reverse',
          delay: 2,
        }}
      />

      {/* Animated Medical Cross */}
      <motion.svg
        // @ts-ignore
        className="absolute left-1/2 right-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 sm:w-16 sm:h-16"
        viewBox="0 0 24 24"
        initial={{ scale: 0, y: 0, rotate: 0 }}
        animate={{
          scale: 1,
          y: [0, 40, 0],
          rotate: [0, 180, 360], // Full rotation
        }}
        transition={{
          scale: { delay: 0.2, type: 'spring' },
          y: {
            duration: 10,
            repeat: Infinity,
            repeatType: 'reverse',
            ease: 'easeInOut',
          },
          rotate: {
            duration: 12,
            repeat: Infinity,
            ease: 'easeInOut',
          },
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
          transition={{ duration: 2, ease: 'easeInOut' }}
        />
        <motion.path
          d="M12 7v10M7 12h10"
          stroke="#ff5b5b"
          strokeWidth="2"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.5, delay: 1 }}
        />
        <motion.path
          d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"
          fill="#ff5b5b"
          fillOpacity="0.1"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
        />
      </motion.svg>

      {/* Pulse effect */}
      <motion.div
        // @ts-ignore
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 sm:w-16 sm:h-16 rounded-full border-2 border-[#ff5b5b]"
        animate={{
          scale: [1, 1.2, 1],
          y: [0, 40, 0],
          opacity: [0.5, 0, 0.5],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
          y: {
            duration: 10,
            repeat: Infinity,
            repeatType: 'reverse',
            ease: 'easeInOut',
          },
        }}
      />

      {/* Floating Medical Icons */}
      {mobileIconPositions.map((pos, i) => (
        <motion.div
          key={i}
          // @ts-ignore
          className="absolute -translate-x-1/2 -translate-y-1/2"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 + i * 0.1 }}
          style={{
            top: pos.top,
            left: pos.left,
          }}
        >
          <motion.div
            // @ts-ignore
            className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 bg-white rounded-full shadow-lg flex items-center justify-center transform-gpu"
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
              className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6"
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
