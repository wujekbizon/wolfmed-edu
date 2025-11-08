import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const isProtectedRoute = createRouteMatcher(['/panel(.*)', '/blog(.*)', '/forum(.*)', '/tp(.*)'])
const isAdminRoute = createRouteMatcher(['/blog/admin(.*)'])
const isTeacherRoute = createRouteMatcher(['/tp', '/tp/settings', '/tp/communication', '/tp/lectures(.*)'])
const isStudentAccessibleRoute = createRouteMatcher(['/tp/rooms', '/tp/rooms/(.*)'])

export default clerkMiddleware(async (auth, request) => {
  // First: Protect all blog/panel/forum/tp routes from unauthenticated users
  if (isProtectedRoute(request)) {
    await auth.protect({
      unauthorizedUrl: `${process.env.NEXT_PUBLIC_APP_URL}/sign-up`,
      unauthenticatedUrl: `${process.env.NEXT_PUBLIC_APP_URL}/sign-in`,
    })
  }

  // Second: Check admin role for /blog/admin routes
  if (isAdminRoute(request)) {
    const { sessionClaims } = await auth()

    // Check if user has admin role in public metadata
    const userRole = (sessionClaims?.metadata as { role?: string })?.role
    if (userRole !== 'admin') {
      // Redirect non-admins to the public blog
      const url = new URL('/blog', request.url)
      return NextResponse.redirect(url)
    }
  }

  // Third: Check teacher role for teaching playground routes (except room pages)
  if (isTeacherRoute(request)) {
    const { sessionClaims } = await auth()

    // Check if user has teacher or admin role
    const userRole = (sessionClaims?.metadata as { role?: string })?.role
    if (userRole !== 'teacher' && userRole !== 'admin') {
      // Redirect non-teachers to home
      const url = new URL('/', request.url)
      return NextResponse.redirect(url)
    }
  }

  // Fourth: Rooms list and room pages allow any authenticated user (already protected by isProtectedRoute)
  // Students can browse and join rooms, but cannot access dashboard/settings/communication
})

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
