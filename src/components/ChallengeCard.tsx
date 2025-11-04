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
  return iconMap[type]
}

export default function ChallengeCard({
  procedureId,
  challengeType,
  label,
  isCompleted,
  score,
}: Props) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-xl border border-zinc-200/60 hover:shadow-lg hover:scale-[1.01] transition-all duration-300 flex flex-col space-y-4">
      {/* Icon */}
      <div
        className={`${
          isCompleted ? 'bg-green-100' : 'bg-zinc-100'
        } rounded-full w-16 h-16 flex items-center justify-center text-4xl mx-auto`}
      >
        {getChallengeIcon(challengeType)}
      </div>

      {/* Title */}
      <div className="text-center flex-1">
        <h3 className="text-lg font-bold text-zinc-800">{label}</h3>
      </div>

      {/* Completion Badge */}
      {isCompleted && (
        <div className="flex justify-center">
          <span className="inline-flex items-center gap-1 rounded-full bg-green-500/20 px-3 py-1 text-xs font-medium text-green-600 border border-green-500/30 animate-scaleIn">
            ✓ Ukończone
          </span>
        </div>
      )}

      {/* Score Progress Bar */}
      {isCompleted && score !== undefined && (
        <div className="space-y-1">
          <div className="flex justify-between text-sm text-zinc-700">
            <span>Wynik:</span>
            <span className="font-semibold">{score}%</span>
          </div>
          <div className="w-full bg-zinc-200 rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-[#f58a8a]/90 to-[#ffc5c5]/90 h-full transition-all duration-500"
              style={{ width: `${score}%` }}
            />
          </div>
        </div>
      )}

      {/* Action Button */}
      <Link
        href={`/panel/procedury/${procedureId}/wyzwania/${challengeType}`}
        className={`
          w-full px-6 py-3 rounded-full text-sm font-semibold text-center transition-all duration-300 hover:shadow-md active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2
          ${
            isCompleted
              ? 'bg-slate-600 text-white hover:bg-slate-700 focus:ring-slate-600'
              : 'bg-gradient-to-r from-[#f58a8a]/90 to-[#ffc5c5]/90 text-zinc-800 focus:ring-[#f58a8a]'
          }
        `}
      >
        {isCompleted ? 'Powtórz' : 'Rozpocznij'}
      </Link>
    </div>
  )
}
