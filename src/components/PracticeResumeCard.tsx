import Link from 'next/link'
import { ArrowRight, BookOpenCheck, ClipboardCheck } from 'lucide-react'

export default function PracticeResumeCard({
  kind,
  title,
  detail,
  progress,
  updatedAt,
  href,
  variant = 'dark',
}: {
  kind: string
  title: string
  detail: string
  progress: number
  updatedAt: Date
  href: string
  variant?: 'dark' | 'light'
}) {
  const percent = Math.min(100, Math.max(0, progress))
  const surface = variant === 'light'
    ? {
        card: 'border-zinc-300 bg-white hover:border-zinc-400 hover:bg-zinc-100',
        icon: 'bg-zinc-100 text-zinc-700',
        kind: 'text-zinc-600',
        title: 'text-zinc-900',
        detail: 'text-zinc-600',
        track: 'bg-zinc-200',
        progress: 'bg-zinc-700',
        updated: 'text-zinc-500',
        action: 'text-zinc-700',
      }
    : {
        card: 'border-zinc-800 bg-slate-900 hover:border-zinc-600 hover:bg-zinc-900',
        icon: 'bg-white/10 text-zinc-100',
        kind: 'text-zinc-300',
        title: 'text-white',
        detail: 'text-zinc-300',
        track: 'bg-white/10',
        progress: 'bg-zinc-300',
        updated: 'text-zinc-400',
        action: 'text-zinc-100',
      }
  return (
    <Link href={href} className={`group flex min-w-0 items-center gap-3 rounded-xl border p-3 shadow-sm transition hover:shadow-md ${surface.card}`}>
      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg ${surface.icon}`}>
        {kind === 'Sesja nauki' ? <BookOpenCheck size={23} /> : <ClipboardCheck size={23} />}
      </div>
      <div className="min-w-0 flex-1">
        <p className={`text-xs font-semibold uppercase tracking-wide ${surface.kind}`}>{kind}</p>
        <h3 className={`truncate text-sm font-bold ${surface.title}`}>{title}</h3>
        <p className={`truncate text-xs ${surface.detail}`}>{detail}</p>
        <div className={`mt-2 h-1.5 overflow-hidden rounded-full ${surface.track}`} role="progressbar" aria-label={`${title} postęp`} aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100}>
          <div className={`h-full rounded-full ${surface.progress}`} style={{ width: `${percent}%` }} />
        </div>
        <p className={`mt-1 text-[11px] ${surface.updated}`}>Zapisano {updatedAt.toLocaleString('pl-PL', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
      </div>
      <span className={`flex shrink-0 items-center gap-1 text-xs font-semibold ${surface.action}`}>
        {kind === 'Sesja nauki' ? 'Wznów naukę' : 'Wznów trening'}
        <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
      </span>
    </Link>
  )
}
