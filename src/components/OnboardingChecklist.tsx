'use client'

import { useState, useEffect } from 'react'
import { CheckCircle2, Circle } from 'lucide-react'
import Link from 'next/link'

const STEPS = [
  { id: 'profile', label: 'Uzupełnij nazwę użytkownika i motto', href: '/panel' },
  { id: 'courses', label: 'Przeglądaj dostępne kierunki', href: '/kierunki' },
  { id: 'test', label: 'Rozwiąż swój pierwszy test', href: '/panel/testy' },
  { id: 'procedures', label: 'Sprawdź procedury medyczne', href: '/panel/procedury' },
  { id: 'ai', label: 'Odkryj AI Notatnik', href: '/panel/nauka' },
]

const STORAGE_KEY = 'wolfmed_onboarding_v1'

export default function OnboardingChecklist() {
  const [checked, setChecked] = useState<string[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) setChecked(JSON.parse(stored))
    setMounted(true)
  }, [])

  const toggle = (id: string) => {
    const next = checked.includes(id)
      ? checked.filter((c) => c !== id)
      : [...checked, id]
    setChecked(next)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  }

  const progress = checked.length
  const allDone = progress === STEPS.length

  if (!mounted) return null

  return (
    <div className="rounded-2xl p-4 bg-gradient-to-br from-white/90 to-rose-50/50 backdrop-blur-xl border border-white/50 shadow-2xl shadow-zinc-950/20">
      <h4 className="text-sm font-semibold text-zinc-800 mb-3">
        Pierwsze kroki{' '}
        <span className="font-normal text-zinc-500">{progress}/{STEPS.length}</span>
      </h4>

      <div className="h-1 w-full rounded-full bg-zinc-200/60 mb-4 overflow-hidden">
        <div
          className="h-1 rounded-full transition-all duration-500"
          style={{ width: `${(progress / STEPS.length) * 100}%`, backgroundColor: '#f65555cc' }}
        />
      </div>

      <ul className="space-y-2.5">
        {STEPS.map((step) => {
          const done = checked.includes(step.id)
          return (
            <li key={step.id} className="flex items-center gap-3">
              <button onClick={() => toggle(step.id)} className="shrink-0 transition-transform hover:scale-110">
                {done ? (
                  <CheckCircle2 className="w-4 h-4" style={{ color: '#f65555' }} />
                ) : (
                  <Circle className="w-4 h-4 text-zinc-400" />
                )}
              </button>
              <Link
                href={step.href}
                className={`text-sm transition-colors ${
                  done ? 'text-zinc-400 line-through' : 'text-zinc-700 hover:text-zinc-900 hover:underline'
                }`}
              >
                {step.label}
              </Link>
            </li>
          )
        })}
      </ul>

      {allDone && (
        <p className="text-xs font-medium mt-3" style={{ color: '#f65555' }}>
          Świetnie! Opanowałeś podstawy platformy.
        </p>
      )}
    </div>
  )
}
