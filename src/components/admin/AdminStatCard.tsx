import type { ReactNode } from 'react'

export default function AdminStatCard({
  label,
  value,
  icon,
  accent,
  footer,
}: {
  label: string
  value: ReactNode
  icon: ReactNode
  accent: string
  footer: ReactNode
}) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-zinc-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-zinc-600 font-medium">{label}</p>
          <p className="text-3xl font-bold text-zinc-900 mt-2">{value}</p>
        </div>
        <div
          className={`w-12 h-12 ${accent} rounded-lg flex items-center justify-center`}
        >
          {icon}
        </div>
      </div>
      <div className="mt-4 text-sm">{footer}</div>
    </div>
  )
}
