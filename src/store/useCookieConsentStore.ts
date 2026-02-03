import { create } from 'zustand'

export const COOKIE_CONSENT_KEY = 'wolfmed_cookie_consent'
export const COOKIE_CONSENT_DURATION_DAYS = 180 // 6 months

export interface CookieConsent {
  necessary: boolean
  performance: boolean
  marketing: boolean
  timestamp: number
}

export const defaultConsent: CookieConsent = {
  necessary: true,
  performance: false,
  marketing: false,
  timestamp: 0,
}

interface CookieConsentState {
  // State
  consent: CookieConsent | null
  showBanner: boolean
  isLoaded: boolean

  // Actions
  initialize: () => void
  openBanner: () => void
  closeBanner: () => void
  acceptAll: () => void
  declineAll: () => void
  savePreferences: (preferences: Partial<CookieConsent>) => void
}

function isConsentValid(consent: CookieConsent): boolean {
  const expirationTime = COOKIE_CONSENT_DURATION_DAYS * 24 * 60 * 60 * 1000
  return Date.now() - consent.timestamp < expirationTime
}

function saveConsentToStorage(consent: CookieConsent): void {
  localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(consent))
  // Dispatch event for GoogleAnalytics component to update consent
  window.dispatchEvent(new CustomEvent('cookieConsentChanged'))
}

export const useCookieConsentStore = create<CookieConsentState>((set, get) => ({
  consent: null,
  showBanner: false,
  isLoaded: false,

  initialize: () => {
    if (typeof window === 'undefined') return

    const stored = localStorage.getItem(COOKIE_CONSENT_KEY)
    if (stored) {
      try {
        const parsed: CookieConsent = JSON.parse(stored)
        if (isConsentValid(parsed)) {
          set({ consent: parsed, showBanner: false, isLoaded: true })
        } else {
          localStorage.removeItem(COOKIE_CONSENT_KEY)
          set({ consent: null, showBanner: true, isLoaded: true })
        }
      } catch {
        localStorage.removeItem(COOKIE_CONSENT_KEY)
        set({ consent: null, showBanner: true, isLoaded: true })
      }
    } else {
      set({ showBanner: true, isLoaded: true })
    }
  },

  openBanner: () => set({ showBanner: true }),

  closeBanner: () => set({ showBanner: false }),

  acceptAll: () => {
    const newConsent: CookieConsent = {
      necessary: true,
      performance: true,
      marketing: true,
      timestamp: Date.now(),
    }
    saveConsentToStorage(newConsent)
    set({ consent: newConsent, showBanner: false })
  },

  declineAll: () => {
    const newConsent: CookieConsent = {
      necessary: true, // Always true - strictly necessary
      performance: false,
      marketing: false,
      timestamp: Date.now(),
    }
    saveConsentToStorage(newConsent)
    set({ consent: newConsent, showBanner: false })
  },

  savePreferences: (preferences) => {
    const newConsent: CookieConsent = {
      necessary: true, // Always true
      performance: preferences.performance ?? false,
      marketing: preferences.marketing ?? false,
      timestamp: Date.now(),
    }
    saveConsentToStorage(newConsent)
    set({ consent: newConsent, showBanner: false })
  },
}))
