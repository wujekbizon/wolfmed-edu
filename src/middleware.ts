import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const isProtectedRoute = createRouteMatcher(['/testy-opiekun(.*)', '/blog(.*)', '/forum(.*)'])

export default clerkMiddleware(async (auth, request) => {
  try {
    if (isProtectedRoute(request)) {
      await auth.protect({
        unauthorizedUrl: `${process.env.NEXT_PUBLIC_APP_URL}/sign-up`,
        unauthenticatedUrl: `${process.env.NEXT_PUBLIC_APP_URL}/sign-in`,
      })
    }
  } catch (error: unknown) {
    console.error('Auth protection error:', error)

    if (error instanceof Error) {
      // Check if the error message contains the 'Token refresh failed' string or network-related issue
      if (error.message.includes('Token refresh failed') || error.message.includes('Failed to fetch')) {
        // Handle session expiry or token refresh failure
        const signInUrl = new URL('/sign-in', request.url)
        signInUrl.searchParams.set('redirect_url', request.url) // Redirect back after sign-in
        return NextResponse.redirect(signInUrl)
      }
    }
  }
  return NextResponse.next()
})

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
