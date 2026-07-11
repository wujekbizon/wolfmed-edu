'use client'

import Link from 'next/link'
import { CalendarClock, Flame, TrendingUp, ArrowRight, type LucideIcon } from 'lucide-react'
import type { PlanProgress } from '@/types/plannerTypes'
import { pluralizePl } from '@/helpers/pluralizePl'

const PACE_CONFIG = {
  ahead: { label: 'Przed planem', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  on_track: { label: 'Zgodnie z planem', className: 'bg-sky-50 text-sky-700 border-sky-200' },
  behind: { label: 'Za planem', className: 'bg-amber-50 text-amber-700 border-amber-200' },
} as const

function formatHours(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60
  if (hours === 0) return `${rest} min`
  if (rest === 0) return `${hours} h`
  return `${hours} h ${rest} min`
}

function StatTile({ icon: Icon, value, label }: { icon: LucideIcon; value: string; label: string }) {
  return (
    <div className="flex-1 flex flex-col gap-2 px-4 py-3.5 border-l border-zinc-200 first:border-l-0">
      <div className="flex items-center gap-2.5">
        <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-[#ff9898] to-fuchsia-400 text-white shadow-sm shrink-0">
          <Icon className="w-4 h-4" />
        </span>
        <span className="text-2xl font-bold text-zinc-800 tabular-nums leading-none">{value}</span>
      </div>
      <span className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">{label}</span>
    </div>
  )
}

export default function AnalyticsPlanTab({ plan }: { plan: PlanProgress }) {
  const pace = PACE_CONFIG[plan.paceStatus]
  const completionPercent =
    plan.plannedTotalMinutes > 0
      ? Math.round(Math.min(1, plan.actualMinutes / plan.plannedTotalMinutes) * 100)
      : 0

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold text-slate-900">{plan.plan.name}</h3>
          <span
            className={`inline-flex items-center mt-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${pace.className}`}
          >
            {pace.label}
          </span>
        </div>
        <Link
          href="/panel/plan"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-zinc-900 text-white text-sm font-semibold hover:bg-zinc-700 transition-colors"
        >
          Otwórz plan
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="flex rounded-xl border border-zinc-200 bg-gradient-to-b from-white to-zinc-50 overflow-hidden">
        <StatTile
          icon={CalendarClock}
          value={String(plan.daysLeft)}
          label={`${pluralizePl(plan.daysLeft, ['dzień', 'dni', 'dni'])} do końca`}
        />
        <StatTile
          icon={TrendingUp}
          value={`${completionPercent}%`}
          label={`${formatHours(plan.actualMinutes)} z ${formatHours(plan.plannedTotalMinutes)}`}
        />
        <StatTile
          icon={Flame}
          value={String(plan.streak)}
          label={`${pluralizePl(plan.streak, ['dzień', 'dni', 'dni'])} z rzędu`}
        />
      </div>

      <div>
        <h4 className="text-sm font-semibold text-zinc-700 mb-3">Zagadnienia w planie</h4>
        <ul className="space-y-2">
          {plan.concepts.map((concept) => {
            const spent = concept.autoMinutes + concept.manualMinutes
            const ratio = concept.targetMinutes > 0 ? Math.min(1, spent / concept.targetMinutes) : 0
            const done = Boolean(concept.completedAt)
            return (
              <li key={concept.id} className="flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className={`text-sm truncate ${done ? 'text-zinc-400 line-through' : 'text-zinc-700'}`}>
                    {concept.label}
                  </p>
                  <div className="h-1.5 mt-1 bg-zinc-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${done ? 'bg-emerald-400' : 'bg-gradient-to-r from-[#ff9898] to-red-500'}`}
                      style={{ width: `${Math.round(ratio * 100)}%` }}
                    />
                  </div>
                </div>
                <span className="text-xs text-zinc-400 whitespace-nowrap tabular-nums">
                  {spent}/{concept.targetMinutes} min
                </span>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}
