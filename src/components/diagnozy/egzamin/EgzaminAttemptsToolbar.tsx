'use client'

import { Search, X } from 'lucide-react'
import Input from '@/components/ui/Input'
import DropdownSelect from '@/components/ui/DropdownSelect'
import {
  EXAM_ATTEMPT_SORT_LABELS,
  EXAM_ATTEMPT_STATUS_LABELS,
} from '@/constants/examAttempts'
import { EXAM_ATTEMPT_SORT_KEYS } from '@/types/diagnozyTypes'
import type {
  ExamAttemptCriteria,
  ExamAttemptSortKey,
  ExamAttemptStatusFilter,
} from '@/types/diagnozyTypes'

const STATUS_KEYS = Object.keys(EXAM_ATTEMPT_STATUS_LABELS) as ExamAttemptStatusFilter[]

export default function EgzaminAttemptsToolbar({
  criteria,
  onChange,
}: {
  criteria: ExamAttemptCriteria
  onChange: (patch: Partial<ExamAttemptCriteria>) => void
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
      <div className="relative flex-1 min-w-0">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
        <Input
          type="text"
          value={criteria.search}
          onChangeHandler={(e) => onChange({ search: e.target.value })}
          placeholder="Szukaj diagnozy…"
          ariaLabel="Szukaj w historii podejść"
          className="w-full h-9 rounded-xl bg-white ring-1 ring-zinc-900/[0.06] pl-9 pr-9 text-sm
            text-zinc-700 focus:outline-none focus:ring-rose-300"
        />
        {criteria.search && (
          <button
            type="button"
            onClick={() => onChange({ search: '' })}
            aria-label="Wyczyść"
            className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-lg text-zinc-400
              hover:text-zinc-600 hover:bg-zinc-100 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <DropdownSelect
        value={criteria.status}
        onSelect={(status) => onChange({ status: status as ExamAttemptStatusFilter })}
        options={STATUS_KEYS.map((key) => ({
          value: key,
          label: EXAM_ATTEMPT_STATUS_LABELS[key],
        }))}
        ariaLabel="Filtruj podejścia"
        className="w-full sm:w-40"
      />

      <DropdownSelect
        value={criteria.sort}
        onSelect={(sort) => onChange({ sort: sort as ExamAttemptSortKey })}
        options={EXAM_ATTEMPT_SORT_KEYS.map((key) => ({
          value: key,
          label: EXAM_ATTEMPT_SORT_LABELS[key],
        }))}
        ariaLabel="Sortuj podejścia"
        className="w-full sm:w-44"
      />
    </div>
  )
}
