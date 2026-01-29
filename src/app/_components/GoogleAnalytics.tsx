import Script from 'next/script'
// import { headers } from 'next/headers'
import { useEffect, useState } from 'react'
import { COOKIE_CONSENT_KEY, CookieConsent } from '@/constants/cookieCategories'
import { GA_ID, GTAG_JS_URI, GTM_JS_URI } from '@/constants/googleAnalytics'

export default function GoogleAnalytics() {
  // const nonce = await headers().then((headers) => headers.get('x-nonce') ?? '')

  const [hasConsent, setHasConsent] = useState(false)

  useEffect(() => {
    const checkConsent = () => {
      const stored = localStorage.getItem(COOKIE_CONSENT_KEY)
      if (stored) {
        try {
          const consent: CookieConsent = JSON.parse(stored)
          setHasConsent(consent.performance === true)
        } catch {
          setHasConsent(false)
        }
      } else {
        setHasConsent(false)
      }
    }

    checkConsent()

    // Listen for storage changes (in case consent is updated in another tab or component)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === COOKIE_CONSENT_KEY) {
        checkConsent()
      }
    }

    // Custom event for same-tab updates
    const handleConsentChange = () => {
      checkConsent()
    }

    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('cookieConsentChanged', handleConsentChange)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('cookieConsentChanged', handleConsentChange)
    }
  }, [])

  if (!hasConsent) {
    return null
  }

  return (
    <>
      <Script strategy="afterInteractive" src={GTAG_JS_URI} />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_ID}', {
          page_path: window.location.pathname });
        `}
      </Script>
      <Script strategy="afterInteractive" src={GTM_JS_URI} />
    </>
  )
}
