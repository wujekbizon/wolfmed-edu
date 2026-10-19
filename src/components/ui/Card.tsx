// A hairline ring rather than a border: 1px solid borders at this density read
// as boxes stacked in boxes. Elevation carries the separation instead.
export default function Card({
  className,
  children,
  variant = 'light',
}: {
  className?: string
  children: React.ReactNode
  variant?: 'light' | 'dark' | 'elevated'
}) {
  return (
    <div
      className={`rounded-2xl ${variant === 'dark'
        ? 'bg-gradient-to-br from-zinc-900/95 to-black/90 backdrop-blur-xl border border-white/[0.08] shadow-2xl shadow-black/50'
        : variant === 'elevated'
          ? 'border border-white/80 bg-linear-to-br from-white to-rose-50/60 shadow-[0_2px_4px_rgba(24,24,27,0.03),0_12px_24px_-12px_rgba(24,24,27,0.22),inset_0_1px_0_rgba(255,255,255,0.9)]'
          : 'bg-white ring-1 ring-zinc-900/[0.06] shadow-[0_1px_2px_rgba(16,24,40,0.04)]'} ${className ?? ''}`}
    >
      {children}
    </div>
  )
}
