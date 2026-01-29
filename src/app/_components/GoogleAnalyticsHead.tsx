import Script from 'next/script'
import { GA_ID, GTAG_JS_URI } from '@/constants/googleAnalytics'

/**
 * Google Analytics Head Component (Server Component)
 *
 * This component should be placed in the <head> tag.
 * It sets up:
 * 1. Default consent state (denied for EU/EEA - RODO compliant)
 * 2. Loads gtag.js script
 * 3. Configures GA4
 *
 * The consent can be updated by the client-side GoogleAnalytics component
 * when user interacts with the cookie banner.
 */
export default function GoogleAnalyticsHead() {
  return (
    <>
      {/* Set default consent BEFORE gtag loads - critical for Consent Mode v2 */}
      <Script id="google-consent-default" strategy="beforeInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}

          // Default consent for EU/EEA users - all denied except security
          // This includes Poland (PL) as part of EEA
          gtag('consent', 'default', {
            'ad_storage': 'denied',
            'ad_user_data': 'denied',
            'ad_personalization': 'denied',
            'analytics_storage': 'denied',
            'functionality_storage': 'denied',
            'personalization_storage': 'denied',
            'security_storage': 'granted',
            'wait_for_update': 500,
            'region': ['PL', 'AT', 'BE', 'BG', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR', 'HU', 'HR', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL', 'NO', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE', 'GB', 'CH', 'IS', 'LI']
          });
        `}
      </Script>

      {/* Load gtag.js */}
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
