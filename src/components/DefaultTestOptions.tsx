'use client'

import React from 'react'
import { testsMenu } from '@/constants/testsMenu'
import RandomTestButton from './RandomTestButton'

interface DefaultTestOptionsProps {
  isLoading?: boolean
}

export default function DefaultTestOptions({ isLoading }: DefaultTestOptionsProps) {
  return (
    <div className="w-full space-y-6">
      <h4 className="text-center text-2xl font-medium text-zinc-900">Pula wszystkich pytań</h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {testsMenu.map((m) => (
          <div
            key={m.testTitle}
            className="flex flex-col items-center p-4 rounded-lg bg-zinc-600 border border-zinc-600/20 hover:border-zinc-300/90 transition-all shadow-sm"
          >
            <p className="mb-2 text-sm text-zinc-200">{m.number} pytań</p>
            <RandomTestButton disabled={isLoading ?? false} number={m.number}>
              {isLoading ? 'Wczytuje testy...' : m.testTitle}
            </RandomTestButton>
          </div>
        ))}
      </div>
    </div>
  )
}
