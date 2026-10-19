import Card from '@/components/ui/Card'
import type { StatCardProps } from '@/types/dashboardStatsTypes'

export default function StatCard({ icon: Icon, value, label, accent = false, iconTone = 'lavender' }: StatCardProps) {
  return (
    <Card variant="elevated" className="relative min-w-0 overflow-hidden p-4 sm:p-5">
      {accent && (
        <span aria-hidden="true" className="pointer-events-none absolute inset-0 bg-linear-to-br from-rose-50/40 to-rose-100/80" />
      )}
      <div className="relative flex h-full flex-col items-start">
        <span
          className={`mb-3 inline-flex size-10 items-center justify-center rounded-xl ring-1 ring-inset ${
            iconTone === 'rose'
              ? 'bg-[#fff0f2] text-[#bf7180] ring-rose-200/70'
              : 'bg-[#f2edf8] text-[#8a70a3] ring-[#e7dff0]'
          }`}
        >
          <Icon aria-hidden="true" className="size-5" />
        </span>
        {value === undefined ? (
          <span aria-hidden="true" className="h-9 w-14 animate-pulse rounded-md bg-zinc-200/60" />
        ) : (
          <span className="text-3xl leading-9 font-bold tracking-tight text-zinc-900 tabular-nums">
            {value}
          </span>
        )}
        <span className="mt-1 text-[13px] leading-5 font-medium text-zinc-600">{label}</span>
      </div>
    </Card>
  )
}
