import { FloatingShapes } from '@/components/FloatingShapes'
import GradientOverlay from '@/components/GradientOverlay'
import { SignIn } from '@clerk/nextjs'

export default function Page() {
  return (
    <section className="relative flex h-[calc(100vh-80px)] w-full items-center justify-center">
      <GradientOverlay />
      <FloatingShapes count={10} />
      <SignIn path="/sign-in" forceRedirectUrl="/" />
    </section>
  )
}
