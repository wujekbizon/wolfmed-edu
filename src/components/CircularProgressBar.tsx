'use client'

import React from 'react'

interface CircularProgressBarProps {
  percentage: number
  color: string
  size: number
  strokeWidth: number
}

const CircularProgressBar: React.FC<CircularProgressBarProps> = ({ percentage, color, size, strokeWidth }) => {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const strokeDashoffset = circumference - (percentage / 100) * circumference

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle
        className="text-gray-200"
        strokeWidth={strokeWidth}
        stroke="currentColor"
        fill="transparent"
        r={radius}
        cx={size / 2}
        cy={size / 2}
      />
      <circle
        className="text-blue-600"
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={strokeDashoffset}
        strokeLinecap="round"
        stroke={color}
        fill="transparent"
        r={radius}
        cx={size / 2}
        cy={size / 2}
        style={{
          transition: 'stroke-dashoffset 0.5s ease 0s',
          transform: 'rotate(-90deg)',
          transformOrigin: '50% 50%',
        }}
      />
      <text x="50%" y="50%" dy=".3em" textAnchor="middle" className="font-bold text-xl" fill={color}>
        {`${Math.round(percentage)}%`}
      </text>
    </svg>
  )
}

export default CircularProgressBar
