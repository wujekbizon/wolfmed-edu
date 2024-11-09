'use client'

import { motion } from 'framer-motion'

type LinearProgressBarProps = {
  percentage: number
  totalScore: number
  totalQuestions: number
  color?: string
  bgColor?: string
}

export default function LinearProgressBar({
  percentage,
  totalScore,
  totalQuestions,
  color = '#ff9898',
  bgColor = 'rgba(255, 255, 255, 0.1)',
}: LinearProgressBarProps) {
  return (
    <div className="w-full">
      <div className="w-full rounded-full h-2 sm:h-4 mb-2" style={{ backgroundColor: bgColor }}>
        <motion.div
          // @ts-ignore
          className="h-2 sm:h-4 rounded-full"
          style={{ backgroundColor: color }}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: 'easeInOut' }}
        />
      </div>
      <motion.div
        // @ts-ignore
        className="flex justify-between text-xs sm:text-sm"
        initial={false}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
      >
        <p className="text-zinc-400">{totalScore || 0}</p>
        <p className="font-semibold text-zinc-300">
          {totalScore} / {totalQuestions} ({percentage.toFixed(2)}%)
        </p>
        <p className="text-zinc-400">{totalQuestions}</p>
      </motion.div>
    </div>
  )
}
