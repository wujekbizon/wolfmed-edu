'use client'

import { useEffect, useCallback } from 'react'
import { COOKIE_CONSENT_KEY, CookieConsent } from '@/constants/cookieCategories'

// Declare gtag on window for TypeScript
declare global {
  interface Window {
    dataLayer: unknown[]
    gtag: (...args: unknown[]) => void
  }
}

/**
 * Google Analytics Consent Update Component (Client Component)
 *
 * This component handles updating Google's consent state when user
 * interacts with the cookie banner. It should be placed in the <body>.
 *
 * The actual gtag scripts are loaded by GoogleAnalyticsHead in <head>.
 * This component only listens for consent changes and updates Google.
 *
 * @see https://developers.google.com/tag-platform/security/guides/consent
 */
export default function GoogleAnalytics() {
  // Update consent state based on user choice
  const updateConsent = useCallback((hasAnalyticsConsent: boolean) => {
    if (typeof window.gtag !== 'function') return

    const consentState = hasAnalyticsConsent ? 'granted' : 'denied'

    window.gtag('consent', 'update', {
      'ad_storage': 'denied', // We don't use ads, always denied
      'ad_user_data': 'denied', // We don't use ads, always denied
      'ad_personalization': 'denied', // We don't use ads, always denied
      'analytics_storage': consentState,
    })
  }, [])

  // Check stored consent and update Google
  const checkAndApplyConsent = useCallback(() => {
    const stored = localStorage.getItem(COOKIE_CONSENT_KEY)
    if (stored) {
      try {
        const consent: CookieConsent = JSON.parse(stored)
        const hasPerformanceConsent = consent.performance === true
        updateConsent(hasPerformanceConsent)
      } catch {
        updateConsent(false)
      }
    }
  }, [updateConsent])

  // Check consent on mount and listen for changes
  useEffect(() => {
    // Check if user already gave consent
    checkAndApplyConsent()

    // Listen for storage changes (in case consent is updated in another tab)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === COOKIE_CONSENT_KEY) {
        checkAndApplyConsent()
      }
    }

    // Custom event for same-tab updates (from cookie banner)
    const handleConsentChange = () => {
      checkAndApplyConsent()
    }

    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('cookieConsentChanged', handleConsentChange)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('cookieConsentChanged', handleConsentChange)
    }
  }, [checkAndApplyConsent])

  // This component doesn't render anything visible
  // It only handles consent updates
  return null
}
