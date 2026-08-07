import type { PathFact } from '@/types/pathStoryTypes'

export default function PathFacts({ facts }: { facts: PathFact[] }) {
  return (
    <>
      <div className="h-px bg-zinc-900/12" />
      <dl className="mt-6 grid gap-3.5">
        {facts.map((fact) => (
          <div key={fact.label} className="flex items-baseline gap-3.5">
            <dt className="w-[78px] shrink-0 font-mono text-[10.5px] font-medium uppercase leading-none text-zinc-400">
              {fact.label}
            </dt>
            <dd className="text-[15px] font-medium leading-[1.4] text-slate-900">
              {fact.value}
            </dd>
          </div>
        ))}
      </dl>
    </>
  )
}
