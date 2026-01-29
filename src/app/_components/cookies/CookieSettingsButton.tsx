'use client'

import { useCookieConsentStore } from '@/store/useCookieConsentStore'

export default function CookieSettingsButton() {
  const openBanner = useCookieConsentStore((state) => state.openBanner)

  return (
    <button
      onClick={openBanner}
      className="hover:text-red-500 transition-colors text-left"
    >
      Ustawienia cookies
    </button>
  )
}
