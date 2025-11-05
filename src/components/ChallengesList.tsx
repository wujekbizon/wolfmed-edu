'use client'

import Link from 'next/link'
import { ChallengeType, CHALLENGE_TYPE_LABELS, ProcedureProgress } from '@/types/challengeTypes'
import type { Procedure } from '@/types/dataTypes'
import ChallengeCard from '@/components/ChallengeCard'
import { getProcedureSlugFromId } from '@/constants/procedureSlugs'

interface Props {
  procedure: Procedure
  progress: ProcedureProgress
}

export default function ChallengesList({ procedure, progress }: Props) {
  const procedureName = procedure.data.name
  const procedureSlug = getProcedureSlugFromId(procedure.id) || procedure.id
  const progressPercentage = (progress.totalCompleted / 5) * 100

  // Define all 5 challenges
  const allChallenges: ChallengeType[] = [
    ChallengeType.ORDER_STEPS,
    ChallengeType.KNOWLEDGE_QUIZ,
    ChallengeType.VISUAL_RECOGNITION,
    ChallengeType.SPOT_ERROR,
    ChallengeType.SCENARIO_BASED,
  ]

  return (
    <section className="w-full h-full overflow-y-auto scrollbar-webkit p-4 lg:p-16 bg-zinc-50">
      <div className="max-w-7xl mx-auto space-y-6 animate-fadeInUp">
        {/* Header Card */}
        <div
          className="bg-white p-6 rounded-2xl shadow-xl border border-zinc-200/60 animate-slideInUp"
          style={{ '--slidein-delay': '0s' } as React.CSSProperties}
        >
          <h1 className="text-2xl md:text-3xl font-bold text-zinc-800 mb-2">
            Wyzwania: {procedureName}
          </h1>
          <p className="text-sm text-zinc-600 mb-4">
            Ukończ wszystkie 5 wyzwań aby zdobyć odznakę procedury
          </p>

          {/* Progress Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-zinc-700">
                Postęp
              </span>
              <span className="text-base font-bold text-zinc-800">
                {progress.totalCompleted}<span className="text-zinc-500">/5</span>
              </span>
            </div>

            {/* Progress Bar */}
            <div className="bg-zinc-200 rounded-full h-4 overflow-hidden shadow-inner">
              <div
                className="bg-gradient-to-r from-[#f58a8a] via-pink-500 to-[#ffc5c5] h-full transition-all duration-700 ease-out"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>

            {/* Progress Milestones */}
            <div className="flex justify-between">
              {[1, 2, 3, 4, 5].map((milestone) => (
                <div
                  key={milestone}
                  className={`
                    w-3 h-3 rounded-full transition-all duration-300
                    ${
                      progress.totalCompleted >= milestone
                        ? 'bg-gradient-to-br from-[#f58a8a] to-[#ffc5c5] scale-125 shadow-md'
                        : 'bg-zinc-300'
                    }
                  `}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Badge Celebration */}
        {progress.badgeEarned && (
          <div
            className="bg-gradient-to-br from-rose-50 via-pink-50 to-rose-50 p-6 rounded-2xl shadow-xl border border-zinc-200/60 animate-scaleIn"
            style={{ '--slidein-delay': '0.1s' } as React.CSSProperties}
          >
            <div className="flex flex-col md:flex-row items-center gap-4 text-center md:text-left">
              <div className="text-6xl animate-radialPulse">🏆</div>
              <div className="flex-1">
                <h2 className="text-xl md:text-2xl font-bold text-zinc-800 mb-2">
                  Gratulacje! Zdobyłeś odznakę!
                </h2>
                <p className="text-zinc-600">
                  Ukończyłeś wszystkie wyzwania dla tej procedury
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Challenge Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {allChallenges.map((challengeType, index) => {
            const completion = progress.completions[challengeType]
            const isCompleted = !!completion

            return (
              <div
                key={challengeType}
                style={{ '--slidein-delay': `${0.1 + index * 0.1}s` } as React.CSSProperties}
                className="animate-slideInUp"
              >
                <ChallengeCard
                  procedureSlug={procedureSlug}
                  challengeType={challengeType}
                  label={CHALLENGE_TYPE_LABELS[challengeType]}
                  isCompleted={isCompleted}
                  score={completion?.score}
                  attempts={completion?.attempts}
                />
              </div>
            )
          })}
        </div>

        {/* Navigation */}
        <nav className="flex items-center justify-between pt-6 border-t border-zinc-200">
          <Link
            href="/panel/procedury"
            className="group inline-flex items-center gap-2 px-5 py-3 bg-slate-600 hover:bg-slate-700 text-white rounded-full transition-all duration-300 shadow-md hover:shadow-lg"
          >
            <svg
              className="w-5 h-5 transition-transform group-hover:-translate-x-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span className="font-semibold text-sm">Powrót do procedur</span>
          </Link>

          {/* Challenge Statistics */}
          {progress.totalCompleted > 0 && (
            <div className="hidden sm:flex items-center gap-4 text-sm text-zinc-600">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-zinc-800">{progress.totalCompleted}</span>
                <span>ukończonych</span>
              </div>
              <div className="w-1 h-1 bg-zinc-400 rounded-full" />
              <div className="flex items-center gap-2">
                <span className="font-semibold text-zinc-800">{5 - progress.totalCompleted}</span>
                <span>pozostało</span>
              </div>
            </div>
          )}
        </nav>
      </div>
    </section>
  )
}
