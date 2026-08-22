'use client'

import { CreditCard, Settings, SlidersHorizontal } from 'lucide-react'
import BaseModal from './modal/BaseModal'
import ModalHeader from './modal/ModalHeader'
import ModalBody from './modal/ModalBody'
import { useSettingsModalStore } from '@/store/useSettingsModalStore'
import { useSettingsStore } from '@/store/useSettingsStore'
import SettingsToggle from './SettingsToggle'
import SettingsNavLink from './settings/SettingsNavLink'

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
        <SettingsNavLink
          href="/panel/ustawienia"
          icon={<SlidersHorizontal className="h-4 w-4 shrink-0 text-zinc-400" />}
          title="Preferencje nauki"
          description="Cel egzaminacyjny i styl odpowiedzi tutora"
          onClick={closeSettingsModal}
        />

        <p className="mb-4 mt-6 text-xs font-semibold uppercase tracking-widest text-zinc-500">
          Konto
        </p>
        <SettingsNavLink
          href="/panel#platnosci"
          icon={<CreditCard className="h-4 w-4 shrink-0 text-zinc-400" />}
          title="Płatności"
          description="Subskrypcje, zakupy i faktury"
          onClick={closeSettingsModal}
        />
      </ModalBody>
    </BaseModal>
  )
}
