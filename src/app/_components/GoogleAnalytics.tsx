import Script from 'next/script'

export default function GoogleAnalytics() {
  const GA_ID = process.env.NEXT_PUBLIC_MEASUREMENT_ID || 'dev'
  const GTAG_JS_URI = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`

  return (
    <head>
      <Script strategy="lazyOnload" async src={GTAG_JS_URI}>
        <Script>
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_ID}', {
            page_path: window.location.pathname });
         `}
        </Script>
      </Script>
    </head>
  )
}
