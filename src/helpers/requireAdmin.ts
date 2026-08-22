import { redirect } from 'next/navigation'
import { requireUser } from '@/helpers/requireUser'

export async function requireAdmin() {
  const { userId, sessionClaims } = await requireUser()
  const role = (sessionClaims?.metadata as { role?: string })?.role
  if (role !== 'admin') redirect('/')
  return { userId, sessionClaims }
}
