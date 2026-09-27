'use client'

import SideAIInput from './SideAIInput'
import { useSettingsStore } from '@/store/useSettingsStore'
import { usePathname } from 'next/navigation'

export default function MobileAIFloat() {
  const { showMobileAI, setShowMobileAI } = useSettingsStore()
  const pathname = usePathname()

  if (!showMobileAI || (pathname.startsWith('/panel/nauka/') && pathname.split('/').length === 4 && !pathname.includes('/moje-testy__'))) return null

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 pb-[env(safe-area-inset-bottom)]">
      <SideAIInput onDismiss={() => setShowMobileAI(false)} />
    </div>
  )
}
