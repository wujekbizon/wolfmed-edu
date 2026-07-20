import Link from 'next/link'
import { Target, Moon, Trophy, Sparkles, ArrowRight } from 'lucide-react'
import { formatMinutes } from '@/helpers/formatMinutes'
import type { PlanProgress } from '@/types/plannerTypes'

export default function TodayFocusCard({
  todayIsStudyDay,
  suggestion,
  courseSlug,
}: {
  todayIsStudyDay: boolean
  suggestion: PlanProgress['suggestion']
  courseSlug: string
}) {
  const suggestionHref = suggestion?.categoryKey
    ? `/panel/testy?kategoria=${encodeURIComponent(suggestion.categoryKey)}`
    : suggestion?.procedureId
    ? `/panel/procedury/${encodeURIComponent(courseSlug)}`
    : '/panel/nauka'
  const suggestionCta = suggestion?.categoryKey
    ? 'Rozwiąż test'
    : suggestion?.procedureId
    ? 'Otwórz procedurę'
    : 'Otwórz Centrum Nauki'

  return (
    <div className="bg-gradient-to-br from-zinc-900/95 to-black/90 rounded-2xl p-4 sm:p-6 shadow-xl border border-white/[0.08]">
      <h2 className="flex items-center gap-2 text-white font-bold text-lg mb-2">
        <Target className="w-5 h-5 text-[#ff9898]" />
        Dziś w planie
      </h2>
      {!todayIsStudyDay ? (
        <p className="flex items-center gap-2 text-zinc-400 text-sm">
          <Moon className="w-4 h-4 shrink-0" />
          Dziś masz zaplanowany odpoczynek. Wróć w następny dzień nauki — albo zapisz dodatkową sesję poniżej.
        </p>
      ) : suggestion ? (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-zinc-300 text-sm">
            <span className="text-[#ff9898] font-semibold">{suggestion.label}</span>
            {suggestion.remainingMinutesToday > 0 ? (
              <> — zostało Ci dziś {formatMinutes(suggestion.remainingMinutesToday)}</>
            ) : (
              <span className="inline-flex items-center gap-1">
                {' '}— dzienny cel osiągnięty, brawo!
                <Sparkles className="w-4 h-4 text-amber-300" />
              </span>
            )}
          </p>
          <Link
            href={suggestionHref}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition-colors"
          >
            {suggestionCta}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <p className="flex items-center gap-2 text-zinc-300 text-sm">
          <Trophy className="w-4 h-4 shrink-0 text-amber-300" />
          Wszystkie zagadnienia ukończone! Możesz zakończyć plan w ustawieniach.
        </p>
      )}
    </div>
  )
}
