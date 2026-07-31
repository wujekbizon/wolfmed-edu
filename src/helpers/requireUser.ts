import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

export async function requireUser() {
  const { userId, sessionClaims } = await auth()
  if (!userId) redirect('/sign-in')
  return { userId, sessionClaims }
}
