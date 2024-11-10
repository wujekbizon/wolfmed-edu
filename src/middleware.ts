import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'

const isProtectedRoute = createRouteMatcher(['/testy-opiekun(.*)', '/blog(.*)'])

export default clerkMiddleware(async (auth, request) => {
  if (isProtectedRoute(request))
    await auth.protect({
      unauthorizedUrl: `${process.env.NEXT_PUBLIC_APP_URL}/sign-up`,
      unauthenticatedUrl: `${process.env.NEXT_PUBLIC_APP_URL}/sign-up`,
    })

  return applyCsp(request as any)
})

function applyCsp(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64')

  const cspHeader = `
    default-src 'self';
    script-src 'self' 'nonce-${nonce}' https: http: ${
    process.env.NODE_ENV === 'production' ? '' : `'unsafe-eval'`
  } https://challenges.cloudflare.com https://checkout.stripe.com https://js.stripe.com https://www.googletagmanager.com https://www.google-analytics.com;
    connect-src 'self' https://region1.analytics.google.com https://stats.g.doubleclick.net ${
      process.env.NODE_ENV === 'production'
        ? 'https://clerk.wolfmed-edukacja.pl'
        : 'https://definite-mantis-39.clerk.accounts.dev'
    };
    img-src 'self' data: https://img.clerk.com https://utfs.io https://www.google.pl https://www.google.com https://fonts.gstatic.com https://www.googletagmanager.com;
    worker-src 'self' blob:;
    font-src 'self' https://fonts.gstatic.com https://fonts.googleapis.com;
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://www.googletagmanager.com;
    frame-src 'self' https://challenges.cloudflare.com https://checkout.stripe.com https://vercel.live;
    form-action 'self';
  `
  const contentSecurityPolicyHeaderValue = cspHeader.replace(/\s{2,}/g, ' ').trim()

  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-nonce', nonce)
  requestHeaders.set('Content-Security-Policy', contentSecurityPolicyHeaderValue)

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })
  response.headers.set('Content-Security-Policy', contentSecurityPolicyHeaderValue)
  return response
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}
