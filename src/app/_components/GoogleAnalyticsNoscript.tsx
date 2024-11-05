import { headers } from 'next/headers'
import { GTM_JS_URI } from '@/constants/googleAnalytics'

export default async function GoogleAnalyticsNoscript() {
  const nonce = await headers().then((headers) => headers.get('x-nonce') ?? '')

  return (
    <noscript>
      <iframe src={GTM_JS_URI} height="0" width="0" style={{ display: 'none', visibility: 'hidden' }} nonce={nonce} />
    </noscript>
  )
}
