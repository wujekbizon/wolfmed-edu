// A hairline ring rather than a border: 1px solid borders at this density read
// as boxes stacked in boxes. Elevation carries the separation instead.
export default function Card({
  className,
  children,
  variant = 'light',
}: {
  className?: string
  children: React.ReactNode
  variant?: 'light' | 'dark'
}) {
  return (
    <div
      className={`rounded-2xl ${variant === 'dark'
        ? 'bg-gradient-to-br from-zinc-900/95 to-black/90 backdrop-blur-xl border border-white/[0.08] shadow-2xl shadow-black/50'
        : 'bg-white ring-1 ring-zinc-900/[0.06] shadow-[0_1px_2px_rgba(16,24,40,0.04)]'} ${className ?? ''}`}
    >
      {children}
    </div>
  )
}
