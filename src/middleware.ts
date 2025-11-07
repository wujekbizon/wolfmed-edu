import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isProtectedRoute = createRouteMatcher(['/testy-opiekun(.*)', '/blog(.*)', '/forum(.*)', '/tp(.*)'])

export default clerkMiddleware(async (auth, request) => {
  if (isProtectedRoute(request)) {
    await auth.protect({
      unauthorizedUrl: `${process.env.NEXT_PUBLIC_APP_URL}/sign-up`,
      unauthenticatedUrl: `${process.env.NEXT_PUBLIC_APP_URL}/sign-in`,
    })
  }
})

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
