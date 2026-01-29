'use client'

import { COOKIE_CONSENT_KEY } from '@/constants/cookieCategories'

export default function CookieSettingsButton() {
  const handleOpenSettings = () => {
    // Remove the stored consent to show the banner again
    localStorage.removeItem(COOKIE_CONSENT_KEY)
    // Dispatch event to trigger banner display
    window.dispatchEvent(new CustomEvent('cookieConsentChanged'))
    // Force a re-render by reloading just the component state
    window.location.reload()
  }

  return (
    <button onClick={handleOpenSettings} className="hover:text-red-500 transition-colors text-left">
      Ustawienia cookies
    </button>
  )
}
