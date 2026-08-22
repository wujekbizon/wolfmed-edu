import { auth } from '@clerk/nextjs/server'

export async function ensureAdmin() {
  const { userId, sessionClaims } = await auth()
  const role = (sessionClaims?.metadata as { role?: string })?.role
  if (!userId || role !== 'admin') throw new Error('Unauthorized')
  return userId
}
