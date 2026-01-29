'use client'

import Script from 'next/script'
import { useEffect, useState, useCallback } from 'react'
import { COOKIE_CONSENT_KEY, CookieConsent } from '@/constants/cookieCategories'
import { GA_ID, GTAG_JS_URI } from '@/constants/googleAnalytics'

// Declare gtag on window for TypeScript
declare global {
  interface Window {
    dataLayer: unknown[]
    gtag: (...args: unknown[]) => void
  }
}

/**
 * Google Analytics component with Consent Mode v2 integration
 *
 * This component implements Google Consent Mode v2 which:
 * 1. Sets default consent to 'denied' for EU users (RODO compliant)
 * 2. Updates consent state when user makes a choice via cookie banner
 * 3. Allows Google to collect cookieless pings for modeling when consent is denied
 *
 * @see https://developers.google.com/tag-platform/security/guides/consent
 */
export default function GoogleAnalytics() {
  const [consentInitialized, setConsentInitialized] = useState(false)
  const [analyticsConsent, setAnalyticsConsent] = useState<'granted' | 'denied'>('denied')

  // Initialize gtag and dataLayer
  const initializeGtag = useCallback(() => {
    window.dataLayer = window.dataLayer || []
    window.gtag = function gtag() {
      // eslint-disable-next-line prefer-rest-params
      window.dataLayer.push(arguments)
    }
  }, [])

  // Set default consent state (must be called BEFORE gtag loads)
  const setDefaultConsent = useCallback(() => {
    if (typeof window.gtag !== 'function') return

    // Default consent for EU/EEA users - all denied except security
    // This includes Poland (PL) as part of EEA
    window.gtag('consent', 'default', {
      'ad_storage': 'denied',
      'ad_user_data': 'denied',
      'ad_personalization': 'denied',
      'analytics_storage': 'denied',
      'functionality_storage': 'denied',
      'personalization_storage': 'denied',
      'security_storage': 'granted',
      'wait_for_update': 500, // Wait 500ms for consent update
      'region': ['PL', 'AT', 'BE', 'BG', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR', 'HU', 'HR', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL', 'NO', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE', 'GB', 'CH', 'IS', 'LI']
    })
  }, [])

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

    setAnalyticsConsent(consentState)
  }, [])

  // Check stored consent and update Google
  const checkAndApplyConsent = useCallback(() => {
    const stored = localStorage.getItem(COOKIE_CONSENT_KEY)
    if (stored) {
      try {
        const consent: CookieConsent = JSON.parse(stored)
        const hasPerformanceConsent = consent.performance === true
        updateConsent(hasPerformanceConsent)
        return hasPerformanceConsent
      } catch {
        updateConsent(false)
        return false
      }
    }
    return false
  }, [updateConsent])

  // Initialize on mount
  useEffect(() => {
    // Step 1: Initialize gtag function
    initializeGtag()

    // Step 2: Set default consent (denied for EU)
    setDefaultConsent()

    // Step 3: Check if user already gave consent and update
    checkAndApplyConsent()

    setConsentInitialized(true)
  }, [initializeGtag, setDefaultConsent, checkAndApplyConsent])

  // Listen for consent changes
  useEffect(() => {
    if (!consentInitialized) return

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === COOKIE_CONSENT_KEY) {
        checkAndApplyConsent()
      }
    }

    const handleConsentChange = () => {
      checkAndApplyConsent()
    }

    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('cookieConsentChanged', handleConsentChange)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('cookieConsentChanged', handleConsentChange)
    }
  }, [consentInitialized, checkAndApplyConsent])

  // Don't render scripts until consent is initialized
  if (!consentInitialized) return null

  return (
    <>
      {/* Google tag (gtag.js) - loads after consent defaults are set */}
      <Script
        id="gtag-js"
        strategy="afterInteractive"
        src={GTAG_JS_URI}
      />

      {/* Configure GA4 */}
      <Script id="google-analytics-config" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_ID}', {
            page_path: window.location.pathname,
            anonymize_ip: true
          });
        `}
      </Script>
    </>
  )
}
