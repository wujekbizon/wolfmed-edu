import { Suspense } from 'react'
import AuthPage from '@/components/auth/AuthPage'
import AuthShell from '@/components/auth/AuthShell'
import AuthFormSkeleton from '@/components/skeletons/AuthFormSkeleton'

export const metadata = { title: 'Utwórz konto | Wolfmed Edukacja' }

export default function Page() {
  return (
    <AuthShell>
      <Suspense fallback={<AuthFormSkeleton mode="sign-up" />}>
        <AuthPage mode="sign-up" />
      </Suspense>
    </AuthShell>
  )
}
