import { Clock } from 'lucide-react'
import { formatPlDate } from '@/helpers/formatPlDate'

export default function CapacitySummary({
  dueDate,
  hoursTotal,
}: {
  dueDate: string
  hoursTotal: number
}) {
  return (
    <div className="flex items-center gap-3 p-4 rounded-lg bg-[#ff9898]/10 border border-[#ff9898]/30 text-sm text-zinc-600">
      <span className="flex items-center justify-center w-9 h-9 rounded-lg shrink-0 bg-gradient-to-br from-[#ff9898] to-fuchsia-400 text-white">
        <Clock className="w-4 h-4" />
      </span>
      <span>
        Do <span className="font-semibold text-zinc-900">{formatPlDate(`${dueDate}T12:00:00`)}</span>{' '}
        zaplanujesz około <span className="font-semibold text-[#ff9898]">{hoursTotal} h</span> nauki.
      </span>
    </div>
  )
}
