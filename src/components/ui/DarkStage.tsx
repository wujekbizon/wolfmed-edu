export default function DarkStage({
  children,
  className = ''
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={`relative bg-gradient-to-b from-zinc-800/90 to-zinc-950/90 rounded-3xl border-3 border-white shadow-2xl shadow-zinc-950/50 ring-1 ring-inset ring-white/10 ${className}`}
    >
      <div
        aria-hidden
        className='pointer-events-none absolute inset-0 rounded-[inherit] bg-[radial-gradient(circle_at_50%_-10%,rgba(255,91,91,0.07),transparent_55%)]'
      />
      <div
        aria-hidden
        className='pointer-events-none absolute inset-0 rounded-[inherit] opacity-[0.12] [background-image:radial-gradient(rgba(255,255,255,0.7)_1px,transparent_1px)] [background-size:22px_22px]'
      />
      <div className='relative z-10'>{children}</div>
    </div>
  )
}
