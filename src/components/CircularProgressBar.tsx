'use client'

import { motion } from 'framer-motion'

interface CircularProgressBarProps {
  percentage: number
  color: string
  size: number
  strokeWidth: number
  bgColor?: string
}

const CircularProgressBar: React.FC<CircularProgressBarProps> = ({
  percentage,
  color,
  size,
  strokeWidth,
  bgColor = 'rgba(255, 255, 255, 0.1)',
}) => {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const strokeDashoffset = circumference - (percentage / 100) * circumference

  return (
    <motion.svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      initial={false}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1, ease: 'easeOut' }}
    >
      <circle strokeWidth={strokeWidth} stroke={bgColor} fill="transparent" r={radius} cx={size / 2} cy={size / 2} />
      <motion.circle
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset }}
        transition={{ duration: 1, ease: 'easeOut' }}
        strokeLinecap="round"
        stroke={color}
        fill="transparent"
        r={radius}
        cx={size / 2}
        cy={size / 2}
        style={{
          transform: 'rotate(-90deg)',
          transformOrigin: '50% 50%',
        }}
      />
      <motion.text
        x="50%"
        y="50%"
        dy=".3em"
        textAnchor="middle"
        className="font-bold text-lg sm:text-xl"
        fill={color}
        initial={false}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.5 }}
      >
        {`${Math.round(percentage)}%`}
      </motion.text>
    </motion.svg>
  )
}

export default CircularProgressBar
