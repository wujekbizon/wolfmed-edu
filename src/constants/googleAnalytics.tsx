const GTM_ID = process.env.NEXT_PUBLIC_TAG_MANAGER_ID || 'dev'
export const GA_ID = process.env.NEXT_PUBLIC_MEASUREMENT_ID || 'dev'
export const GTAG_JS_URI = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`
export const GTM_JS_URI = `https://www.googletagmanager.com/gtm.js?id=${GTM_ID}`
