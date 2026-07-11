'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { PlanProgress } from '@/types/plannerTypes'
import ConceptList from './ConceptList'
import QuickStudyLogForm from './QuickStudyLogForm'
import PlanSettings from './PlanSettings'

const PACE_CONFIG = {
  ahead: { label: 'Przed planem', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  on_track: { label: 'Zgodnie z planem', className: 'bg-sky-50 text-sky-700 border-sky-200' },
  behind: { label: 'Za planem', className: 'bg-amber-50 text-amber-700 border-amber-200' },
} as const

function formatDate(dateISO: string): string {
  return new Date(dateISO).toLocaleDateString('pl-PL')
}

function formatHours(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60
  if (hours === 0) return `${rest} min`
  if (rest === 0) return `${hours} h`
  return `${hours} h ${rest} min`
}

export default function PlanDashboard({ progress }: { progress: PlanProgress }) {
  const [showSettings, setShowSettings] = useState(false)
  const { plan, suggestion } = progress

  const pace = PACE_CONFIG[progress.paceStatus]
  const completionRatio =
    progress.plannedTotalMinutes > 0
      ? Math.min(1, progress.actualMinutes / progress.plannedTotalMinutes)
      : 0
  const completedConcepts = progress.concepts.filter((c) => c.completedAt).length

  const suggestionHref = suggestion?.categoryKey
    ? `/panel/testy/${suggestion.categoryKey}`
    : '/panel/nauka'

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white border border-zinc-100 rounded-2xl p-4 sm:p-8 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900">{plan.name}</h1>
            {plan.focusLabel && (
              <Link
                href={`/panel/kursy/${encodeURIComponent(plan.focusCategoryKey ?? '')}`}
                className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-600 border border-red-100 hover:bg-red-100"
              >
                {plan.focusLabel}
              </Link>
            )}
            <p className="text-sm text-zinc-500 mt-1">
              Termin: <span className="font-semibold text-zinc-700">{formatDate(plan.dueDate)}</span>
              {' · '}pozostało{' '}
              <span className="font-semibold text-red-500">{progress.daysLeft} dni</span>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${pace.className}`}>
              {pace.label}
            </span>
            {progress.streak > 0 && (
              <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-orange-50 text-orange-700 border border-orange-200">
                🔥 {progress.streak} {progress.streak === 1 ? 'dzień' : 'dni'} z rzędu
              </span>
            )}
            <button
              type="button"
              onClick={() => setShowSettings((value) => !value)}
              className="px-3 py-1.5 rounded-full text-xs font-semibold text-zinc-500 border border-zinc-200 hover:border-zinc-400"
            >
              {showSettings ? 'Zamknij' : 'Ustawienia'}
            </button>
          </div>
        </div>

        <div className="mt-6">
          <div className="flex justify-between text-xs text-zinc-500 mb-1.5">
            <span>
              Postęp: {formatHours(progress.actualMinutes)} z{' '}
              {formatHours(progress.plannedTotalMinutes)}
            </span>
            <span>
              {completedConcepts}/{progress.concepts.length} zagadnień ukończonych
            </span>
          </div>
          <div className="h-2.5 bg-zinc-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-red-500 rounded-full transition-all"
              style={{ width: `${Math.round(completionRatio * 100)}%` }}
            />
          </div>
        </div>

        {showSettings && <PlanSettings plan={plan} />}
      </div>

      <div className="bg-gradient-to-br from-zinc-900/95 to-black/90 rounded-2xl p-4 sm:p-6 shadow-xl border border-white/[0.08]">
        <h2 className="text-white font-bold text-lg mb-1">Dziś w planie</h2>
        {!progress.todayIsStudyDay ? (
          <p className="text-zinc-400 text-sm">
            Dziś masz zaplanowany odpoczynek. Wróć w następny dzień nauki — albo
            zapisz dodatkową sesję poniżej. 💤
          </p>
        ) : suggestion ? (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-zinc-300 text-sm">
              <span className="text-[#ff9898] font-semibold">{suggestion.label}</span>
              {suggestion.remainingMinutesToday > 0 ? (
                <> — zostało Ci dziś {formatHours(suggestion.remainingMinutesToday)}</>
              ) : (
                <> — dzienny cel osiągnięty, brawo! 🎉</>
              )}
            </p>
            <Link
              href={suggestionHref}
              className="px-4 py-2 rounded-lg bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition-colors"
            >
              {suggestion.categoryKey ? 'Rozwiąż test' : 'Otwórz Centrum Nauki'}
            </Link>
          </div>
        ) : (
          <p className="text-zinc-300 text-sm">
            Wszystkie zagadnienia ukończone! Możesz zakończyć plan w ustawieniach. 🏆
          </p>
        )}
      </div>

      <div className="bg-white border border-zinc-100 rounded-2xl p-4 sm:p-8 shadow-sm">
        <h2 className="text-lg font-bold text-zinc-900 mb-4">Zagadnienia</h2>
        <ConceptList planId={plan.id} concepts={progress.concepts} />
      </div>

      <div className="bg-white border border-zinc-100 rounded-2xl p-4 sm:p-8 shadow-sm">
        <h2 className="text-lg font-bold text-zinc-900 mb-1">Zapisz naukę</h2>
        <p className="text-sm text-zinc-500 mb-4">
          Uczysz się z książek albo notatek poza aplikacją? Zapisz to — liczy się
          do Twojego postępu i serii dni nauki.
        </p>
        <QuickStudyLogForm concepts={progress.concepts} />
      </div>
    </div>
  )
}
