import { User } from 'lucide-react'
import type { PracticalBriefExamProps } from '@/types/practicalBriefTypes'

export default function PracticalBriefPatient({ exam }: PracticalBriefExamProps) {
  return (
        <div className="rounded-2xl border border-zinc-200 bg-white overflow-hidden">
          <div className="flex items-center gap-3 p-4 sm:p-5 border-b border-zinc-100 bg-zinc-50">
            <span className="flex items-center justify-center w-11 h-11 rounded-full bg-slate-100 border border-slate-200 text-slate-600 shrink-0">
              <User className="w-5 h-5" />
            </span>
            <div className="flex flex-col gap-1">
              <h2 className="text-base font-bold text-zinc-900 leading-tight">{exam.patient.name}</h2>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-zinc-100 border border-zinc-200 text-zinc-600 text-xs px-2 py-0.5">
                  {exam.patient.ward}
                </span>
                {exam.patient.pesel && (
                  <span className="font-mono text-xs text-zinc-400">PESEL {exam.patient.pesel}</span>
                )}
              </div>
            </div>
          </div>
          <div className="p-4 sm:p-5">
            <p className="text-sm text-zinc-700 leading-relaxed">{exam.patient.description}</p>
          </div>
        </div>
  )
}
