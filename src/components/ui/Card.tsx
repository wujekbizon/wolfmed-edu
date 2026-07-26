// A hairline ring rather than a border: 1px solid borders at this density read
// as boxes stacked in boxes. Elevation carries the separation instead.
const TONES = {
  plain: 'bg-white ring-1 ring-zinc-900/[0.06] shadow-[0_1px_2px_rgba(16,24,40,0.04)]',
  active:
    'bg-rose-50/40 ring-1 ring-rose-400/40 shadow-[0_1px_2px_rgba(190,24,93,0.06),0_12px_28px_-16px_rgba(190,24,93,0.25)]',
  muted: 'bg-zinc-50/80 ring-1 ring-zinc-900/[0.04]',
  bare: '',
} as const

export type CardTone = keyof typeof TONES

export default function Card({
  tone = 'plain',
  className,
  children,
}: {
  tone?: CardTone
  className?: string
  children: React.ReactNode
}) {
  return (
    <div className={`rounded-2xl transition-shadow ${TONES[tone]} ${className ?? ''}`}>
      {children}
    </div>
  )
}
