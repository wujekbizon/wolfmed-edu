import { auth } from '@clerk/nextjs/server'

export async function isAdmin() {
  const { userId, sessionClaims } = await auth()
  const role = (sessionClaims?.metadata as { role?: string })?.role
  return !!userId && role === 'admin'
}
