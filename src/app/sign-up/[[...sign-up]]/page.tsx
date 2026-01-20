import { FloatingShapes } from '@/components/FloatingShapes'
import GradientOverlay from '@/components/GradientOverlay'
import { SignUp } from '@clerk/nextjs'

export default function Page() {
  return (
    <section className="relative flex h-[calc(100vh-80px)] w-full items-center justify-center">
      <GradientOverlay />
      <FloatingShapes count={10} />
      <SignUp path="/sign-up" forceRedirectUrl="/" />
    </section>
  )
}
