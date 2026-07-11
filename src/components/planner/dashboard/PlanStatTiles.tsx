import { CalendarClock, TrendingUp, Flame } from 'lucide-react'
import StatTile from '../StatTile'
import { pluralizePl } from '@/helpers/pluralizePl'
import { formatMinutes } from '@/helpers/formatMinutes'
import { formatPlDate } from '@/helpers/formatPlDate'
import type { PlanProgress } from '@/types/plannerTypes'

export default function PlanStatTiles({
  progress,
  completionPercent,
}: {
  progress: PlanProgress
  completionPercent: number
}) {
  const dayForm = (n: number) => pluralizePl(n, ['dzień', 'dni', 'dni'])

  return (
    <div className="mt-6 flex rounded-xl border border-zinc-200 bg-gradient-to-b from-white to-zinc-50 overflow-hidden">
      <StatTile
        icon={CalendarClock}
        value={String(progress.daysLeft)}
        label={`${dayForm(progress.daysLeft)} do ${formatPlDate(progress.plan.dueDate)}`}
      />
      <StatTile
        icon={TrendingUp}
        value={`${completionPercent}%`}
        label={`${formatMinutes(progress.actualMinutes)} z ${formatMinutes(progress.plannedTotalMinutes)}`}
      />
      <StatTile
        icon={Flame}
        value={String(progress.streak)}
        label={`${dayForm(progress.streak)} z rzędu`}
      />
    </div>
  )
}
