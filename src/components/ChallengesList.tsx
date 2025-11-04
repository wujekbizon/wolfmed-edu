'use client'

import Link from 'next/link'
import { ChallengeType, CHALLENGE_TYPE_LABELS, ProcedureProgress } from '@/types/challengeTypes'
import type { Procedure } from '@/types/dataTypes'
import ChallengeCard from '@/components/ChallengeCard'

interface Props {
  procedure: Procedure
  progress: ProcedureProgress
}

export default function ChallengesList({ procedure, progress }: Props) {
  const procedureName = procedure.data.name
  const procedureId = procedure.id

  // Define all 5 challenges
  const allChallenges: ChallengeType[] = [
    ChallengeType.ORDER_STEPS,
    ChallengeType.KNOWLEDGE_QUIZ,
    ChallengeType.VISUAL_RECOGNITION,
    ChallengeType.SPOT_ERROR,
    ChallengeType.SCENARIO_BASED,
  ]

  return (
    <section className="relative min-h-screen w-full px-4 sm:px-6 lg:px-8 py-8 animate-fadeInUp">
      {/* Background gradient overlay */}
      <div className="fixed inset-0 -z-10 opacity-5">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 animate-gradientRotate blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <header className="mb-8 sm:mb-12" style={{ '--slidein-delay': '0.1s' } as React.CSSProperties}>
          <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 border border-zinc-700 rounded-2xl p-6 sm:p-8 lg:p-10 shadow-2xl animate-slideInUp">
            {/* Procedure Title */}
            <div className="mb-6">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-3 tracking-tight">
                Wyzwania: <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">{procedureName}</span>
              </h1>
              <p className="text-sm sm:text-base lg:text-lg text-zinc-400 max-w-2xl">
                Ukończ wszystkie 5 wyzwań aby zdobyć odznakę procedury
              </p>
            </div>

            {/* Progress Section */}
            <div className="space-y-4">
              {/* Progress Header */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-zinc-300 uppercase tracking-wide">
                  Postęp
                </span>
                <span className="text-lg font-bold text-white bg-zinc-800 px-4 py-1.5 rounded-full border border-zinc-600">
                  {progress.totalCompleted}<span className="text-zinc-500">/5</span>
                </span>
              </div>

              {/* Progress Bar */}
              <div className="relative w-full bg-zinc-800 rounded-full h-4 overflow-hidden border border-zinc-700 shadow-inner">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full transition-all duration-700 ease-out relative overflow-hidden"
                  style={{ width: `${(progress.totalCompleted / 5) * 100}%` }}
                >
                  {/* Animated shine effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-gradientPosition" />
                </div>
              </div>

              {/* Progress Milestones */}
              <div className="flex justify-between mt-2">
                {[1, 2, 3, 4, 5].map((milestone) => (
                  <div
                    key={milestone}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      progress.totalCompleted >= milestone
                        ? 'bg-purple-400 scale-125 shadow-lg shadow-purple-500/50'
                        : 'bg-zinc-700'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Badge Earned Celebration */}
            {progress.badgeEarned && (
              <div
                className="mt-6 p-5 bg-gradient-to-r from-amber-500/20 via-yellow-500/20 to-amber-500/20 border-2 border-amber-500/50 rounded-xl backdrop-blur-sm animate-scaleIn"
                style={{ '--slidein-delay': '0.3s' } as React.CSSProperties}
              >
                <div className="flex items-center gap-4">
                  <div className="text-5xl animate-radialPulse">🏆</div>
                  <div className="flex-1">
                    <p className="text-amber-400 font-bold text-lg mb-1">
                      Gratulacje! Zdobyłeś odznakę!
                    </p>
                    <p className="text-amber-300/80 text-sm">
                      Ukończyłeś wszystkie wyzwania dla tej procedury
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Challenge Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
          {allChallenges.map((challengeType, index) => {
            const completion = progress.completions[challengeType]
            const isCompleted = !!completion

            return (
              <div
                key={challengeType}
                style={{ '--slidein-delay': `${0.2 + index * 0.1}s` } as React.CSSProperties}
                className="animate-slideInUp"
              >
                <ChallengeCard
                  procedureId={procedureId}
                  challengeType={challengeType}
                  label={CHALLENGE_TYPE_LABELS[challengeType]}
                  isCompleted={isCompleted}
                  score={completion?.score}
                />
              </div>
            )
          })}
        </div>

        {/* Navigation */}
        <nav className="flex items-center justify-between pt-6 border-t border-zinc-800">
          <Link
            href="/panel/procedury"
            className="group inline-flex items-center gap-2 px-5 py-3 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg transition-all duration-300 border border-zinc-700 hover:border-zinc-600 shadow-lg hover:shadow-xl"
          >
            <svg
              className="w-5 h-5 transition-transform group-hover:-translate-x-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span className="font-semibold">Powrót do procedur</span>
          </Link>

          {/* Optional: Add challenge statistics */}
          {progress.totalCompleted > 0 && (
            <div className="hidden sm:flex items-center gap-4 text-sm text-zinc-400">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-white">{progress.totalCompleted}</span>
                <span>ukończonych</span>
              </div>
              <div className="w-1 h-1 bg-zinc-600 rounded-full" />
              <div className="flex items-center gap-2">
                <span className="font-semibold text-white">{5 - progress.totalCompleted}</span>
                <span>pozostało</span>
              </div>
            </div>
          )}
        </nav>
      </div>
    </section>
  )
}
