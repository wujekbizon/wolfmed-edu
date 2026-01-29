'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  COOKIE_CONSENT_KEY,
  COOKIE_CONSENT_DURATION_DAYS,
  CookieConsent,
  defaultConsent,
} from '@/constants/cookieCategories'

interface UseCookieConsentReturn {
  consent: CookieConsent | null
  showBanner: boolean
  isLoaded: boolean
  acceptAll: () => void
  declineAll: () => void
  savePreferences: (preferences: Partial<CookieConsent>) => void
  openSettings: () => void
}

function isConsentValid(consent: CookieConsent): boolean {
  const expirationTime = COOKIE_CONSENT_DURATION_DAYS * 24 * 60 * 60 * 1000
  return Date.now() - consent.timestamp < expirationTime
}

export function useCookieConsent(): UseCookieConsentReturn {
  const [consent, setConsent] = useState<CookieConsent | null>(null)
  const [showBanner, setShowBanner] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem(COOKIE_CONSENT_KEY)
    if (stored) {
      try {
        const parsed: CookieConsent = JSON.parse(stored)
        if (isConsentValid(parsed)) {
          setConsent(parsed)
          setShowBanner(false)
        } else {
          localStorage.removeItem(COOKIE_CONSENT_KEY)
          setShowBanner(true)
        }
      } catch {
        localStorage.removeItem(COOKIE_CONSENT_KEY)
        setShowBanner(true)
      }
    } else {
      setShowBanner(true)
    }
    setIsLoaded(true)
  }, [])

  const saveConsent = useCallback((newConsent: CookieConsent) => {
    const consentWithTimestamp = {
      ...newConsent,
      timestamp: Date.now(),
    }
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(consentWithTimestamp))
    setConsent(consentWithTimestamp)
    setShowBanner(false)

    // Dispatch custom event for components listening to consent changes
    window.dispatchEvent(new CustomEvent('cookieConsentChanged'))
  }, [])

  const acceptAll = useCallback(() => {
    saveConsent({
      necessary: true,
      performance: true,
      timestamp: Date.now(),
    })
  }, [saveConsent])

  const declineAll = useCallback(() => {
    saveConsent({
      ...defaultConsent,
      timestamp: Date.now(),
    })
  }, [saveConsent])

  const savePreferences = useCallback(
    (preferences: Partial<CookieConsent>) => {
      saveConsent({
        necessary: true,
        performance: preferences.performance ?? false,
        timestamp: Date.now(),
      })
    },
    [saveConsent]
  )

  const openSettings = useCallback(() => {
    setShowBanner(true)
  }, [])

  return {
    consent,
    showBanner,
    isLoaded,
    acceptAll,
    declineAll,
    savePreferences,
    openSettings,
  }
}
