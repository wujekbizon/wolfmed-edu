import FeatureCheck from '@/components/ui/FeatureCheck'
import type { ComparisonGroup } from '@/types/pricingTypes'

export default function PlanComparisonCards({ groups }: { groups: ComparisonGroup[] }) {
  return (
    <div className="md:hidden flex flex-col gap-4">
      {groups.map((group) => (
        <section
          key={group.label}
          className="rounded-3xl bg-white ring-1 ring-zinc-200 shadow-sm overflow-hidden"
        >
          <h3 className="bg-zinc-50/70 py-3 px-5 text-xs font-semibold uppercase tracking-wide text-zinc-500">
            {group.label}
          </h3>
          <dl className="divide-y divide-zinc-100">
            {group.rows.map((row) => (
              <div key={row.label} className="py-4 px-5">
                <dt className="text-sm text-zinc-700">{row.label}</dt>
                <dd className="mt-2 flex items-center gap-6">
                  <span className="flex items-center gap-2">
                    <span className="text-xs uppercase tracking-wide text-zinc-400">Standard</span>
                    <FeatureCheck value={row.basic} />
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="text-xs uppercase tracking-wide text-zinc-400">Premium</span>
                    <FeatureCheck value={row.premium} />
                  </span>
                </dd>
              </div>
            ))}
          </dl>
        </section>
      ))}
    </div>
  )
}
