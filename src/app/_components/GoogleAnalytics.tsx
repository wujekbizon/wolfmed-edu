import Script from 'next/script'
// import { headers } from 'next/headers'
import { GA_ID, GTAG_JS_URI, GTM_JS_URI } from '@/constants/googleAnalytics'

export default function GoogleAnalytics() {
  // const nonce = await headers().then((headers) => headers.get('x-nonce') ?? '')

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
