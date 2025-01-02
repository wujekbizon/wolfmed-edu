'use client'

import { useState } from 'react'
import CountdownTimer from './CountdownTimer'
import { ExamPeriod } from '@/types/examCountdownTypes'

interface ExamCountdownDisplayProps {
  initialPeriod: ExamPeriod | null
  initialTimeLeft: {
    days: number
    hours: number
    minutes: number
    seconds: number
  }
}

export default function ExamCountdownDisplay({ initialPeriod, initialTimeLeft }: ExamCountdownDisplayProps) {
  const [currentPeriod] = useState(initialPeriod)

  if (!currentPeriod) return null

  return (
    <>
      <h3 className="text-lg sm:text-xl font-bold text-white text-center mb-2 sm:mb-4">{currentPeriod.label}</h3>
      {currentPeriod.type !== 'in_progress' && (
        <CountdownTimer
          initialDays={initialTimeLeft.days}
          initialHours={initialTimeLeft.hours}
          initialMinutes={initialTimeLeft.minutes}
          initialSeconds={initialTimeLeft.seconds}
        />
      )}
      <p className="text-zinc-400 text-xs sm:text-sm text-center mt-3 sm:mt-4">
        {currentPeriod.type === 'in_progress' ? (
          <>
            Egzaminy trwają od{' '}
            <span className="text-[#ff9898] ml-1 font-medium">
              {currentPeriod.startDate.toLocaleDateString('pl-PL')}
            </span>{' '}
            do{' '}
            <span className="text-[#ff9898] ml-1 font-medium">{currentPeriod.endDate.toLocaleDateString('pl-PL')}</span>
          </>
        ) : currentPeriod.type === 'waiting_results' ? (
          <>
            Wyniki będą dostępne{' '}
            <span className="text-[#ff9898] ml-1 font-medium">{currentPeriod.endDate.toLocaleDateString('pl-PL')}</span>
          </>
        ) : (
          <>
            Egzaminy odbędą się od{' '}
            <span className="text-[#ff9898] ml-1 font-medium">
              {currentPeriod.startDate.toLocaleDateString('pl-PL')}
            </span>{' '}
            do{' '}
            <span className="text-[#ff9898] ml-1 font-medium">{currentPeriod.endDate.toLocaleDateString('pl-PL')}</span>
          </>
        )}
      </p>
    </>
  )
}
