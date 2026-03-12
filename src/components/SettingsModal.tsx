'use client'

import { Settings } from 'lucide-react'
import BaseModal, { ModalHeader, ModalBody } from './BaseModal'
import { useSettingsModalStore } from '@/store/useSettingsModalStore'
import { useSettingsStore } from '@/store/useSettingsStore'

export default function SettingsModal() {
  const { isOpen, closeSettingsModal } = useSettingsModalStore()
  const { showMobileAI, setShowMobileAI } = useSettingsStore()

  if (!isOpen) return null

  return (
    <BaseModal onClose={closeSettingsModal} size="sm">
      <ModalHeader
        title="Ustawienia"
        icon={<Settings className="w-4 h-4 text-zinc-400" />}
        onClose={closeSettingsModal}
      />
      <ModalBody>
        <p className="text-xs font-semibold tracking-widest text-zinc-500 uppercase mb-4">
          Interfejs
        </p>
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-zinc-200">Asystent AI na telefon</p>
            <p className="text-xs text-zinc-500 mt-0.5">Pokaż skrót do asystenta na dole ekranu</p>
          </div>
          <button
            role="switch"
            aria-checked={showMobileAI}
            onClick={() => setShowMobileAI(!showMobileAI)}
            className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border-2 transition-colors duration-200
              ${showMobileAI
                ? 'bg-rose-400 border-rose-400'
                : 'bg-zinc-700 border-zinc-700'
              }`}
          >
            <span
              className={`inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-200
                ${showMobileAI ? 'translate-x-5' : 'translate-x-0.5'}`}
            />
          </button>
        </div>
      </ModalBody>
    </BaseModal>
  )
}
