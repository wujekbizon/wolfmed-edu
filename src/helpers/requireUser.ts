import { auth } from '@clerk/nextjs/server'

export async function requireUser() {
  const { userId, sessionClaims } = await auth.protect()
  return { userId, sessionClaims }
}
