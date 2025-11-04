'use client'

import Link from 'next/link'
import { ChallengeType } from '@/types/challengeTypes'

interface Props {
  procedureId: string
  challengeType: ChallengeType
  label: string
  isCompleted: boolean
  score: number | undefined
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
  return <span className="text-2xl">{iconMap[type]}</span>
}

export default function ChallengeCard({
  procedureId,
  challengeType,
  label,
  isCompleted,
  score,
}: Props) {
  return (
    <div
      className={`group relative p-6 rounded-xl border-2 transition-all duration-300 hover:scale-105 hover:shadow-2xl ${
        isCompleted
          ? 'bg-gradient-to-br from-emerald-900/40 to-teal-900/40 border-emerald-500/50 shadow-lg shadow-emerald-500/20'
          : 'bg-gradient-to-br from-zinc-900 to-zinc-800 border-zinc-700 hover:border-zinc-600 hover:shadow-purple-500/20'
      }`}
    >
      {/* Completion Badge */}
      {isCompleted && (
        <div className="absolute -top-3 -right-3 z-10">
          <div className="bg-gradient-to-br from-emerald-400 to-teal-500 text-white rounded-full w-12 h-12 flex items-center justify-center text-2xl shadow-lg border-4 border-zinc-900 animate-scaleIn">
            ✓
          </div>
        </div>
      )}

      {/* Challenge Icon */}
      <div
        className={`mb-4 flex items-center justify-center w-14 h-14 rounded-xl transition-all duration-300 ${
          isCompleted
            ? 'bg-emerald-500/20 text-emerald-400'
            : 'bg-zinc-800 text-zinc-400 group-hover:bg-purple-500/20 group-hover:text-purple-400'
        }`}
      >
        {getChallengeIcon(challengeType)}
      </div>

      {/* Challenge Info */}
      <div className="mb-5">
        <h3
          className={`text-lg font-bold mb-2 transition-colors ${
            isCompleted ? 'text-emerald-300' : 'text-white'
          }`}
        >
          {label}
        </h3>

        {isCompleted && score !== undefined && (
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-zinc-800 rounded-full h-2 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-400 to-teal-400 transition-all duration-500"
                style={{ width: `${score}%` }}
              />
            </div>
            <span className="text-emerald-400 font-bold text-sm">{score}%</span>
          </div>
        )}
      </div>

      {/* Action Button */}
      <Link
        href={`/panel/procedury/${procedureId}/wyzwania/${challengeType}`}
        className={`block w-full py-3 px-4 rounded-lg text-center font-semibold transition-all duration-300 ${
          isCompleted
            ? 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-lg hover:shadow-emerald-500/50'
            : 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-lg hover:shadow-purple-500/50'
        }`}
      >
        {isCompleted ? 'Powtórz' : 'Rozpocznij'}
      </Link>
    </div>
  )
}
