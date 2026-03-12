'use client'

import SideAIInput from './SideAIInput'
import { useSettingsStore } from '@/store/useSettingsStore'

export default function MobileAIFloat() {
  const { showMobileAI, setShowMobileAI } = useSettingsStore()

  if (!showMobileAI) return null

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 pb-[env(safe-area-inset-bottom)]">
      <SideAIInput onDismiss={() => setShowMobileAI(false)} />
    </div>
  )
}
