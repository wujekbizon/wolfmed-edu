import Link from 'next/link'
import { ArrowUpRight, LockKeyhole } from 'lucide-react'
import Card from '@/components/ui/Card'
import type { DashboardToolProps } from '@/types/dashboardDiscoveryTypes'

export default function DashboardToolCard({ tool, hasPremium, upgradeHref, loading }: DashboardToolProps) {
  const locked = tool.premium && !hasPremium
  const Icon = tool.icon

  return (
    <Link href={locked ? upgradeHref : tool.href} className="group rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-rose-500">
      <Card variant="elevated" className="h-full p-4 transition-transform motion-safe:group-hover:-translate-y-0.5 sm:p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <span className={`flex size-10 items-center justify-center rounded-xl ring-1 ring-inset ${tool.iconTone === 'lavender' ? 'bg-[#f2edf8] text-[#8a70a3] ring-[#e7dff0]' : 'bg-[#fff0f2] text-[#bf7180] ring-[#f2dfe3]'}`}>
            <Icon aria-hidden="true" className="size-5" />
          </span>
          {tool.premium && <span className="text-[11px] font-medium text-rose-700">Premium</span>}
        </div>
        <h4 className="text-sm font-semibold text-zinc-900">{tool.label}</h4>
        <p className="mt-1 text-xs leading-5 text-zinc-600">{tool.description}</p>
        {loading ? <div className="mt-4 h-4 w-24 animate-pulse rounded bg-zinc-200/60" /> : (
          <span className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-zinc-700 group-hover:text-rose-700">
            {locked ? 'Poznaj Premium' : 'Otwórz'}
            {locked ? <LockKeyhole aria-hidden="true" className="size-3.5" /> : <ArrowUpRight aria-hidden="true" className="size-3.5" />}
          </span>
        )}
      </Card>
    </Link>
  )
}
