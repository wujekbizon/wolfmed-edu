'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  CalendarClock,
  Flame,
  TrendingUp,
  Settings2,
  Moon,
  Trophy,
  NotebookPen,
  ListChecks,
  Sparkles,
  Target,
  ArrowRight,
  type LucideIcon,
} from 'lucide-react'
import type { PlanProgress } from '@/types/plannerTypes'
import { pluralizePl } from '@/helpers/pluralizePl'
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

function StatTile({
  icon: Icon,
  value,
  label,
}: {
  icon: LucideIcon
  value: string
  label: string
}) {
  return (
    <div className="flex-1 flex flex-col gap-2 px-4 py-3.5 border-l border-zinc-200 first:border-l-0">
      <div className="flex items-center gap-2.5">
        <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-[#ff9898] to-fuchsia-400 text-white shadow-sm shrink-0">
          <Icon className="w-4 h-4" />
        </span>
        <span className="text-2xl font-bold text-zinc-800 tabular-nums leading-none">
          {value}
        </span>
      </div>
      <span className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
        {label}
      </span>
    </div>
  )
}

export default function PlanDashboard({ progress }: { progress: PlanProgress }) {
  const [showSettings, setShowSettings] = useState(false)
  const { plan, suggestion } = progress

  const pace = PACE_CONFIG[progress.paceStatus]
  const completionRatio =
    progress.plannedTotalMinutes > 0
      ? Math.min(1, progress.actualMinutes / progress.plannedTotalMinutes)
      : 0
  const completionPercent = Math.round(completionRatio * 100)
  const completedConcepts = progress.concepts.filter((c) => c.completedAt).length

  const suggestionHref = suggestion?.categoryKey
    ? `/panel/testy/${suggestion.categoryKey}`
    : '/panel/nauka'

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white border border-zinc-200 rounded-2xl p-4 sm:p-8 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900">{plan.name}</h1>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              {plan.focusLabel && (
                <Link
                  href={`/panel/kursy/${encodeURIComponent(plan.focusCategoryKey ?? '')}`}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-600 border border-red-100 hover:bg-red-100 transition-colors"
                >
                  {plan.focusLabel}
                </Link>
              )}
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${pace.className}`}
              >
                {pace.label}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowSettings((value) => !value)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-zinc-500 border border-zinc-200 hover:border-zinc-400 transition-colors"
          >
            <Settings2 className="w-3.5 h-3.5" />
            {showSettings ? 'Zamknij' : 'Ustawienia'}
          </button>
        </div>

        <div className="mt-6 flex rounded-xl border border-zinc-200 bg-gradient-to-b from-white to-zinc-50 overflow-hidden">
          <StatTile
            icon={CalendarClock}
            value={String(progress.daysLeft)}
            label={`${pluralizePl(progress.daysLeft, ['dzień', 'dni', 'dni'])} do ${formatDate(plan.dueDate)}`}
          />
          <StatTile
            icon={TrendingUp}
            value={`${completionPercent}%`}
            label={`${formatHours(progress.actualMinutes)} z ${formatHours(progress.plannedTotalMinutes)}`}
          />
          <StatTile
            icon={Flame}
            value={String(progress.streak)}
            label={`${pluralizePl(progress.streak, ['dzień', 'dni', 'dni'])} z rzędu`}
          />
        </div>

        <div className="mt-4">
          <div className="flex justify-between text-xs text-zinc-500 mb-1.5">
            <span>Postęp planu</span>
            <span>
              {completedConcepts}/{progress.concepts.length} zagadnień ukończonych
            </span>
          </div>
          <div className="h-2.5 bg-zinc-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#ff9898] to-red-500 rounded-full transition-all"
              style={{ width: `${completionPercent}%` }}
            />
          </div>
        </div>

        {showSettings && <PlanSettings plan={plan} />}
      </div>

      <div className="bg-gradient-to-br from-zinc-900/95 to-black/90 rounded-2xl p-4 sm:p-6 shadow-xl border border-white/[0.08]">
        <h2 className="flex items-center gap-2 text-white font-bold text-lg mb-2">
          <Target className="w-5 h-5 text-[#ff9898]" />
          Dziś w planie
        </h2>
        {!progress.todayIsStudyDay ? (
          <p className="flex items-center gap-2 text-zinc-400 text-sm">
            <Moon className="w-4 h-4 shrink-0" />
            Dziś masz zaplanowany odpoczynek. Wróć w następny dzień nauki — albo
            zapisz dodatkową sesję poniżej.
          </p>
        ) : suggestion ? (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-zinc-300 text-sm">
              <span className="text-[#ff9898] font-semibold">{suggestion.label}</span>
              {suggestion.remainingMinutesToday > 0 ? (
                <> — zostało Ci dziś {formatHours(suggestion.remainingMinutesToday)}</>
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
              {suggestion.categoryKey ? 'Rozwiąż test' : 'Otwórz Centrum Nauki'}
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

      <div className="bg-white border border-zinc-200 rounded-2xl p-4 sm:p-8 shadow-sm">
        <h2 className="flex items-center gap-2 text-lg font-bold text-zinc-900 mb-4">
          <ListChecks className="w-5 h-5 text-[#ff9898]" />
          Zagadnienia
          <span className="ml-1 text-sm font-semibold text-zinc-400">
            {completedConcepts}/{progress.concepts.length}
          </span>
        </h2>
        <ConceptList planId={plan.id} concepts={progress.concepts} />
      </div>

      <div className="bg-white border border-zinc-200 rounded-2xl p-4 sm:p-8 shadow-sm">
        <h2 className="flex items-center gap-2 text-lg font-bold text-zinc-900 mb-1">
          <NotebookPen className="w-5 h-5 text-[#ff9898]" />
          Zapisz naukę
        </h2>
        <p className="text-sm text-zinc-500 mb-4">
          Uczysz się z książek albo notatek poza aplikacją? Zapisz to — liczy się
          do Twojego postępu i serii dni nauki.
        </p>
        <QuickStudyLogForm concepts={progress.concepts} />
      </div>
    </div>
  )
}
