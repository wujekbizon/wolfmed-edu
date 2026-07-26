const TONES = {
  plain: 'bg-white border-surface-border',
  active: 'bg-rose-50/60 border-rose-300 shadow-card-raised',
  muted: 'bg-surface border-surface-border',
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
    <div
      className={`rounded-card border shadow-card transition-colors ${TONES[tone]} ${className ?? ''}`}
    >
      {children}
    </div>
  )
}
