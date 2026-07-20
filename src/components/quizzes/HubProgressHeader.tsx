'use client'

import { motion } from 'framer-motion'
import { Award, Trophy } from 'lucide-react'

export default function HubProgressHeader({
  completedCount,
  totalTypes,
  badgeEarned,
}: {
  completedCount: number
  totalTypes: number
  badgeEarned: boolean
}) {
  const total = totalTypes
  const percent = Math.round((completedCount / total) * 100)

  return (
    <div className="bg-white border border-zinc-200 rounded-2xl p-5 sm:p-6 shadow-sm">
      <div className="flex items-center justify-between gap-4 mb-3">
        <p className="flex items-center gap-2 text-sm font-semibold text-zinc-700">
          <Award className="w-4 h-4 text-[#ff9898]" />
          Postęp do odznaki
        </p>
        <span className="text-sm font-bold text-zinc-800 tabular-nums">
          {completedCount}
          <span className="text-zinc-400"> / {total}</span>
        </span>
      </div>

      <div className="h-2.5 bg-zinc-100 rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-[#ff9898] to-fuchsia-400"
          initial={false}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>

      {badgeEarned ? (
        <div className="mt-4 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50/70 px-4 py-3">
          <Trophy className="w-5 h-5 text-emerald-600 shrink-0" />
          <p className="text-sm text-emerald-800">
            <span className="font-semibold">Odznaka zdobyta!</span> Ukończone wszystkie
            wyzwania tej procedury.
          </p>
        </div>
      ) : (
        <p className="mt-3 text-xs text-zinc-400">
          Zalicz każde z {total} wyzwań (min. 70%), aby zdobyć odznakę procedury.
        </p>
      )}
    </div>
  )
}
