'use client'

import Link from 'next/link'
import { ArrowRight, Brain, ClipboardList, SearchCheck, Sparkles, Stethoscope, CheckCircle2 } from 'lucide-react'
import { ChallengeType, CHALLENGE_TYPE_LABELS } from '@/types/challengeTypes'
import type { ChallengeCompletion } from '@/types/challengeTypes'

const TYPE_ICONS = {
  [ChallengeType.ORDER_STEPS]: ClipboardList,
  [ChallengeType.KNOWLEDGE_QUIZ]: Brain,
  [ChallengeType.SPOT_ERROR]: SearchCheck,
  [ChallengeType.SCENARIO_BASED]: Stethoscope,
}

const AI_TYPES: ChallengeType[] = [
  ChallengeType.KNOWLEDGE_QUIZ,
  ChallengeType.SPOT_ERROR,
  ChallengeType.SCENARIO_BASED,
]

export default function ChallengeTypeCard({
  challengeType,
  procedureSlug,
  completion,
}: {
  challengeType: ChallengeType
  procedureSlug: string
  completion?: ChallengeCompletion | undefined
}) {
  const Icon = TYPE_ICONS[challengeType]
  const isAi = AI_TYPES.includes(challengeType)
  const done = !!completion

  return (
    <Link
      href={`/panel/procedury/opiekun-medyczny/${procedureSlug}/wyzwania/${challengeType}`}
      className="group flex flex-col bg-white border border-zinc-200 rounded-2xl p-5 shadow-sm hover:shadow-lg hover:border-[#ff9898]/60 transition-all duration-300"
    >
      <div className="flex items-start justify-between mb-4">
        <span className="flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br from-[#ff9898]/15 to-fuchsia-400/15 text-[#e05c5c] group-hover:from-[#ff9898] group-hover:to-fuchsia-400 group-hover:text-white transition-colors duration-300">
          <Icon className="w-5 h-5" />
        </span>
        {isAi && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide bg-zinc-900 text-white">
            <Sparkles className="w-3 h-3 text-[#ffc5c5]" />
            AI
          </span>
        )}
      </div>

      <h3 className="text-sm font-bold text-zinc-800 mb-1">
        {CHALLENGE_TYPE_LABELS[challengeType]}
      </h3>

      {done ? (
        <p className="flex items-center gap-1.5 text-xs text-emerald-600 font-semibold">
          <CheckCircle2 className="w-3.5 h-3.5" />
          Wynik: {completion!.score}%
          <span className="text-zinc-400 font-normal">
            · {completion!.attempts} {completion!.attempts === 1 ? 'próba' : 'próby'}
          </span>
        </p>
      ) : (
        <p className="text-xs text-zinc-400">Jeszcze nieukończone</p>
      )}

      <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 group-hover:text-red-500 group-hover:gap-2.5 transition-all">
        {done ? 'Popraw wynik' : 'Rozpocznij'}
        <ArrowRight className="w-3.5 h-3.5" />
      </span>
    </Link>
  )
}
