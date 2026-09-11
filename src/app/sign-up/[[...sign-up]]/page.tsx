import { FloatingShapes } from '@/components/FloatingShapes'
import GradientOverlay from '@/components/GradientOverlay'
import { SignUp } from '@clerk/nextjs'
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

export default async function Page() {
  const { userId } = await auth()
  if (userId) redirect('/panel')

  return (
    <section className="relative flex h-[calc(100vh-80px)] w-full items-center justify-center">
      <GradientOverlay />
      <FloatingShapes count={10} />
      <SignUp path="/sign-up" fallbackRedirectUrl="/" />
    </section>
  )
}
