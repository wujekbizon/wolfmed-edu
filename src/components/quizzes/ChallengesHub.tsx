'use client'

import Link from 'next/link'
import { ArrowLeft, Swords } from 'lucide-react'
import { challengeTypesForCourse } from '@/helpers/challengeTypesForCourse'
import type { ChallengesHubProps } from '@/types/quizUiTypes'
import HubProgressHeader from './HubProgressHeader'
import ChallengeTypeCard from './ChallengeTypeCard'

export default function ChallengesHub({
  course,
  procedureName,
  procedureSlug,
  progress,
}: ChallengesHubProps) {
  const types = challengeTypesForCourse(course)
  const completedCount = types.filter((type) => progress.completions[type]).length

  return (
    <section className="w-full h-full overflow-y-auto scrollbar-webkit bg-zinc-50 p-4 lg:p-10">
      <div className="max-w-5xl mx-auto space-y-6 animate-fadeInUp">
        <div>
          <Link
            href={`/panel/procedury/${course}`}
            className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-700 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Powrót do procedur
          </Link>
          <h1 className="flex items-center gap-2.5 mt-3 text-2xl md:text-3xl font-bold text-zinc-900">
            <Swords className="w-6 h-6 text-[#ff9898]" />
            Wyzwania
          </h1>
          <p className="text-sm text-zinc-500 mt-1">{procedureName}</p>
        </div>

        <HubProgressHeader
          completedCount={completedCount}
          totalTypes={types.length}
          badgeEarned={progress.badgeEarned}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {types.map((challengeType) => (
            <ChallengeTypeCard
              key={challengeType}
              course={course}
              challengeType={challengeType}
              procedureSlug={procedureSlug}
              completion={progress.completions[challengeType]}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
