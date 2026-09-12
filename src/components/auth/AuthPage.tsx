import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import type { AuthPageProps } from '@/types/authTypes'
import AuthForm from './AuthForm'

export default async function AuthPage({ mode }: AuthPageProps) {
  const { userId } = await auth()
  if (userId) redirect('/panel')

  return <AuthForm mode={mode} />
}
