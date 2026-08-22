import FeatureCheck from '@/components/ui/FeatureCheck'
import type { ComparisonGroup } from '@/types/pricingTypes'

export default function PlanComparisonTable({ groups }: { groups: ComparisonGroup[] }) {
  return (
    <div className="hidden md:block overflow-x-auto rounded-3xl bg-white ring-1 ring-zinc-200 shadow-sm">
      <table className="w-full border-collapse text-left">
        <thead>
          <tr className="border-b border-zinc-200">
            <th scope="col" className="py-5 px-6 text-sm font-semibold text-slate-900 w-1/2">
              Porównaj plany
            </th>
            <th scope="col" className="py-5 px-6 text-center text-sm font-semibold text-slate-900">
              Standard
            </th>
            <th scope="col" className="py-5 px-6 text-center text-sm font-semibold text-slate-900">
              Premium
            </th>
          </tr>
        </thead>
        {groups.map((group) => (
          <tbody key={group.label}>
            <tr className="bg-zinc-50/70">
              <th
                scope="colgroup"
                colSpan={3}
                className="py-3 px-6 text-xs font-semibold uppercase tracking-wide text-zinc-500"
              >
                {group.label}
              </th>
            </tr>
            {group.rows.map((row) => (
              <tr key={row.label} className="border-t border-zinc-100">
                <th scope="row" className="py-4 px-6 text-sm font-normal text-zinc-700">
                  {row.label}
                </th>
                <td className="py-4 px-6 text-center">
                  <FeatureCheck value={row.basic} />
                </td>
                <td className="py-4 px-6 text-center">
                  <FeatureCheck value={row.premium} />
                </td>
              </tr>
            ))}
          </tbody>
        ))}
      </table>
    </div>
  )
}
