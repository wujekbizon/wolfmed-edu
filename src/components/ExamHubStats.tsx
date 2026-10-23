import type { ExamHubStatsProps } from '@/types/examHubTypes'

export default function ExamHubStats({ stats }: ExamHubStatsProps) {
  return (
    <dl className='grid grid-cols-2 gap-3 rounded-2xl border border-white/10 bg-linear-to-br from-zinc-800 to-zinc-950 p-4 shadow-lg sm:p-5'>
      {stats.map((stat) => (
        <div key={stat.label} className='min-w-0 border-l border-white/10 pl-3 first:border-0 first:pl-0'>
          <dt className='flex items-center gap-2 text-xs text-zinc-300'>{stat.icon}{stat.label}</dt>
          <dd className='mt-2 text-2xl font-bold text-[#ff9898] tabular-nums sm:text-3xl'>{stat.value}</dd>
        </div>
      ))}
    </dl>
  )
}
