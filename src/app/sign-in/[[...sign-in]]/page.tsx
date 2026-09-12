import { Suspense } from 'react'
import AuthPage from '@/components/auth/AuthPage'
import AuthShell from '@/components/auth/AuthShell'
import AuthFormSkeleton from '@/components/skeletons/AuthFormSkeleton'

export const metadata = { title: 'Zaloguj się | Wolfmed Edukacja' }

export default function Page() {
  return (
    <AuthShell>
      <Suspense fallback={<AuthFormSkeleton mode="sign-in" />}>
        <AuthPage mode="sign-in" />
      </Suspense>
    </AuthShell>
  )
}
