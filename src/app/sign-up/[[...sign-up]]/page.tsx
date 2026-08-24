import { FloatingShapes } from '@/components/FloatingShapes'
import GradientOverlay from '@/components/GradientOverlay'
import { SignUp } from '@clerk/nextjs'

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

export default function Page() {
  return (
    <section className="relative flex h-[calc(100vh-80px)] w-full items-center justify-center">
      <GradientOverlay />
      <FloatingShapes count={10} />
      <SignUp path="/sign-up" fallbackRedirectUrl="/" />
    </section>
  )
}
