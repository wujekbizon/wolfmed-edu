'use client'

import { useEffect, useState } from 'react'
import { Wand2 } from 'lucide-react'
import BaseModal from '@/components/modal/BaseModal'

const STATUS_MESSAGES = [
  'Tworzę nowy przypadek pacjenta…',
  'Układam karty dokumentacji…',
  'Dobieram czynności i procedury…',
  'Przygotowuję klucz odpowiedzi…',
  'Finalizuję arkusz…',
]

export default function GeneratePracticalExamModal() {
  const [messageIndex, setMessageIndex] = useState(0)
  const [progress, setProgress] = useState(8)

  useEffect(() => {
    const messageTimer = setInterval(() => {
      setMessageIndex((i) => (i + 1) % STATUS_MESSAGES.length)
    }, 2500)

    // The generation is a single atomic call with no real sub-stages, so we
    // ease the bar toward ~92% and let it complete when the view unmounts on
    // navigation to the finished arkusz.
    const progressTimer = setInterval(() => {
      setProgress((p) => (p >= 92 ? p : p + Math.max(1, Math.round((92 - p) / 12))))
    }, 600)

    return () => {
      clearInterval(messageTimer)
      clearInterval(progressTimer)
    }
  }, [])

  return (
    <BaseModal onClose={() => {}} size="sm">
      <div className="p-6 sm:p-8 flex flex-col items-center text-center gap-5">
        <span className="flex items-center justify-center w-14 h-14 rounded-2xl bg-violet-500/15 border border-violet-500/30">
          <Wand2 className="w-7 h-7 text-violet-300 animate-pulse" />
        </span>

        <div className="flex flex-col gap-1.5">
          <h2 className="text-lg font-bold text-white">Generuję nowy arkusz</h2>
          <p className="text-sm text-zinc-400 min-h-[20px]">{STATUS_MESSAGES[messageIndex]}</p>
        </div>

        <div className="w-full space-y-1.5">
          <div className="flex items-center justify-between text-xs text-zinc-500">
            <span>Postęp</span>
            <span className="font-mono">{progress}%</span>
          </div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-violet-500 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <p className="text-xs text-zinc-500">
          To potrwa kilka chwil. AI przygotowuje kompletny arkusz MED.14.
        </p>
      </div>
    </BaseModal>
  )
}
