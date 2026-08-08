import type { PathFact } from '@/types/pathStoryTypes'

export default function PathFacts({ facts }: { facts: PathFact[] }) {
  return (
    <dl className="border-t border-white/10 pt-6 flex flex-col gap-3">
      {facts.map((fact) => (
        <div key={fact.label} className="flex gap-4">
          <dt className="w-20 shrink-0 pt-0.5 text-[11px] uppercase tracking-widest text-zinc-400">
            {fact.label}
          </dt>
          <dd className="text-sm font-medium text-zinc-100">{fact.value}</dd>
        </div>
      ))}
    </dl>
  )
}
