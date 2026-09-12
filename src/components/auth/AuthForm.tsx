'use client'

import { useSyncExternalStore } from 'react'
import { SignIn, SignUp } from '@clerk/nextjs'
import { authAppearance } from '@/constants/authAppearance'
import AuthFormSkeleton from '@/components/skeletons/AuthFormSkeleton'
import type { AuthPageProps } from '@/types/authTypes'

export default function AuthForm({ mode }: AuthPageProps) {
  // Clerk may finish loading before a streamed server boundary hydrates.
  const mounted = useSyncExternalStore(() => () => {}, () => true, () => false)
  if (!mounted) return <AuthFormSkeleton mode={mode} />

  return mode === 'sign-in' ? (
    <SignIn
      path="/sign-in"
      routing="path"
      signUpUrl="/sign-up"
      fallbackRedirectUrl="/"
      fallback={<AuthFormSkeleton mode={mode} />}
      appearance={authAppearance}
    />
  ) : (
    <SignUp
      path="/sign-up"
      routing="path"
      signInUrl="/sign-in"
      fallbackRedirectUrl="/"
      fallback={<AuthFormSkeleton mode={mode} />}
      appearance={authAppearance}
    />
  )
}
