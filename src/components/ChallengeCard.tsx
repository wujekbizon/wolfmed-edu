'use client'

import Link from 'next/link'
import { ChallengeType } from '@/types/challengeTypes'

interface Props {
  procedureSlug: string
  challengeType: ChallengeType
  label: string
  isCompleted: boolean
  score: number | undefined
  attempts: number | undefined
}

// Helper function for challenge icons
function getChallengeIcon(type: ChallengeType) {
  const iconMap = {
    [ChallengeType.ORDER_STEPS]: '📋',
    [ChallengeType.KNOWLEDGE_QUIZ]: '🧠',
    [ChallengeType.VISUAL_RECOGNITION]: '👁️',
    [ChallengeType.SPOT_ERROR]: '🔍',
    [ChallengeType.SCENARIO_BASED]: '🏥',
  }
  return iconMap[type]
}

// Performance tier type
interface PerformanceTier {
  background: string
  border: string
  badge: string
  progressBar: string
  iconContainer: string
}

// Helper to get performance tier styling
function getPerformanceTier(score?: number): PerformanceTier {
  // Excellent (90-100%) - Emerald/Teal
  if (score && score >= 90) {
    return {
      background: 'bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50',
      border: 'border-2 border-emerald-300/60',
      badge: 'bg-emerald-100 text-emerald-800 border border-emerald-400',
      progressBar: 'bg-gradient-to-r from-emerald-400 to-teal-500',
      iconContainer: 'bg-gradient-to-br from-emerald-100 to-teal-100',
    }
  }

  // Good/Pass (70-89%) - Blue/Indigo
  if (score && score >= 70) {
    return {
      background: 'bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-50',
      border: 'border-2 border-blue-300/60',
      badge: 'bg-blue-100 text-blue-800 border border-blue-400',
      progressBar: 'bg-gradient-to-r from-blue-400 to-indigo-500',
      iconContainer: 'bg-gradient-to-br from-blue-100 to-indigo-100',
    }
  }

  // Medium/Fail (50-69%) - Amber/Yellow
  if (score && score >= 50) {
    return {
      background: 'bg-gradient-to-br from-amber-50 via-yellow-50 to-amber-50',
      border: 'border-2 border-amber-300/60',
      badge: 'bg-amber-100 text-amber-800 border border-amber-400',
      progressBar: 'bg-gradient-to-r from-amber-400 to-yellow-500',
      iconContainer: 'bg-gradient-to-br from-amber-100 to-yellow-100',
    }
  }

  // Poor (0-49%) - Red/Orange
  if (score && score >= 0) {
    return {
      background: 'bg-gradient-to-br from-red-50 via-orange-50 to-red-50',
      border: 'border-2 border-red-300/60',
      badge: 'bg-red-100 text-red-800 border border-red-400',
      progressBar: 'bg-gradient-to-r from-red-400 to-orange-500',
      iconContainer: 'bg-gradient-to-br from-red-100 to-orange-100',
    }
  }

  // Incomplete - White with gray icon
  return {
    background: 'bg-white',
    border: 'border-2 border-zinc-200/60',
    badge: '',
    progressBar: '',
    iconContainer: 'bg-gradient-to-br from-zinc-50 to-slate-50',
  }
}

export default function ChallengeCard({
  procedureSlug,
  challengeType,
  label,
  isCompleted,
  score,
  attempts,
}: Props) {
  const tier = getPerformanceTier(score)

  return (
    <div
      className={`
        p-6 rounded-2xl shadow-xl
        hover:shadow-2xl hover:scale-[1.02]
        transition-all duration-300
        flex flex-col space-y-4
        ${tier.background} ${tier.border}
      `}
    >
      {/* Icon with performance-based gradient background */}
      <div className={`w-16 h-16 rounded-xl flex items-center justify-center text-4xl mx-auto ${tier.iconContainer}`}>
        {getChallengeIcon(challengeType)}
      </div>

      {/* Title - PLAIN TEXT (no pink gradient) */}
      <div className="text-center flex-1">
        <h3 className="text-lg font-bold text-zinc-800">
          {label}
        </h3>
      </div>

      {/* Score badge (colored by performance tier) */}
      {isCompleted && score !== undefined && (
        <div className="flex justify-center">
          <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold ${tier.badge}`}>
            {score}%
            {attempts !== undefined && (
              <>
                {' • '}
                {attempts} {attempts === 1 ? 'próba' : 'próby'}
              </>
            )}
          </span>
        </div>
      )}

      {/* Progress bar with performance-based gradient */}
      {isCompleted && score !== undefined && (
        <div className="mb-2">
          <div className="bg-zinc-200 rounded-full h-3 overflow-hidden shadow-inner">
            <div
              className={`h-full transition-all duration-500 ${tier.progressBar}`}
              style={{ width: `${score}%` }}
            />
          </div>
        </div>
      )}

      {/* Action button - PINK ONLY FOR INCOMPLETE */}
      <Link
        href={`/panel/procedury/${procedureSlug}/wyzwania/${challengeType}`}
        className={`
          block w-full text-center px-6 py-3 rounded-full font-semibold
          shadow-md hover:shadow-lg transition-all duration-200
          ${
            isCompleted
              ? 'bg-gradient-to-r from-slate-600 to-slate-700 text-white hover:from-slate-700 hover:to-slate-800'
              : 'bg-gradient-to-r from-[#f58a8a] to-[#ffc5c5] text-white hover:shadow-xl hover:scale-105'
          }
        `}
      >
        {isCompleted ? 'Powtórz' : 'Rozpocznij'}
      </Link>
    </div>
  )
}
