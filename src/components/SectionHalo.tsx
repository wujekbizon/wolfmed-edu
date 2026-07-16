// Soft radial bloom placed behind a section header so it sits in a pool of
// light — sections hand off through glow rather than butting into each other.
export default function SectionHalo({ className = '' }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute left-1/2 top-0 h-[420px] w-[min(880px,90vw)] -translate-x-1/2 -translate-y-1/4 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.55),rgba(255,91,91,0.07)_45%,transparent_70%)] blur-2xl ${className}`}
    />
  )
}
