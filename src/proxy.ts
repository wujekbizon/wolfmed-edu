import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const isProtectedRoute = createRouteMatcher(['/panel(.*)', '/blog(.*)', '/forum(.*)'])
const isAdminRoute = createRouteMatcher(['/admin(.*)'])

export default clerkMiddleware(async (auth, request) => {
  if (isProtectedRoute(request)) {
    await auth.protect({
      unauthorizedUrl: `${process.env.NEXT_PUBLIC_APP_URL}/sign-up`,
      unauthenticatedUrl: `${process.env.NEXT_PUBLIC_APP_URL}/sign-in`,
    })

    // Check course ownership for /panel routes
    if (request.nextUrl.pathname.startsWith('/panel')) {
      const { sessionClaims } = await auth()
      const ownedCourses = sessionClaims?.publicMetadata?.ownedCourses as string[] | undefined

      if (!ownedCourses || ownedCourses.length === 0) {
        const url = new URL('/kierunki', request.url)
        return NextResponse.redirect(url)
      }
    }
  }

  if (isAdminRoute(request)) {
    const { sessionClaims } = await auth()

    const userRole = (sessionClaims?.metadata as { role?: string })?.role
    if (userRole !== 'admin') {
      const url = new URL('/admin', request.url)
      return NextResponse.redirect(url)
    }
  }
})

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
