'use client'

import { Settings, ChevronRight, SlidersHorizontal } from 'lucide-react'
import Link from 'next/link'
import BaseModal from './modal/BaseModal'
import ModalHeader from './modal/ModalHeader'
import ModalBody from './modal/ModalBody'
import { useSettingsModalStore } from '@/store/useSettingsModalStore'
import { useSettingsStore } from '@/store/useSettingsStore'
import SettingsToggle from './SettingsToggle'

export default function SettingsModal() {
  const { isOpen, closeSettingsModal } = useSettingsModalStore()
  const { showMobileAI, setShowMobileAI, slashCommandsEnabled, setSlashCommandsEnabled } =
    useSettingsStore()

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
        <div className="flex flex-col gap-5">
          <SettingsToggle
            label="Asystent AI na telefon"
            description="Pokaż skrót do asystenta na dole ekranu"
            checked={showMobileAI}
            onChange={setShowMobileAI}
          />
        </div>

        <p className="text-xs font-semibold tracking-widest text-zinc-500 uppercase mt-6 mb-4">
          Nauka
        </p>
        <div className="flex flex-col gap-5 mb-5">
          <SettingsToggle
            label="Komendy /"
            description="Wpisuj polecenia ukośnikiem zamiast wybierać je przyciskami"
            checked={slashCommandsEnabled}
            onChange={setSlashCommandsEnabled}
          />
        </div>
        <Link
          href="/panel/ustawienia"
          onClick={closeSettingsModal}
          className="flex items-center justify-between gap-4 rounded-lg -mx-2 px-2 py-2 transition-colors hover:bg-zinc-800/60"
        >
          <div className="flex items-center gap-3">
            <SlidersHorizontal className="w-4 h-4 text-zinc-400 shrink-0" />
            <div>
              <p className="text-sm font-medium text-zinc-200">Preferencje nauki</p>
              <p className="text-xs text-zinc-500 mt-0.5">Cel egzaminacyjny i styl odpowiedzi tutora</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-zinc-500 shrink-0" />
        </Link>
      </ModalBody>
    </BaseModal>
  )
}
