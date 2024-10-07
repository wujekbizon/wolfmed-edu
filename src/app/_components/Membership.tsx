import { SignedIn, SignedOut } from '@clerk/nextjs'
import RegisterNow from '@/components/RegisterNow'
import ThankYou from '@/components/ThankYou'

export default function Membership() {
  return (
    <section className="bg-gradient-to-b from-zinc-50 to-zinc-800 w-full h-full py-8">
      <SignedIn>
        <ThankYou />
      </SignedIn>
      <SignedOut>
        <RegisterNow />
      </SignedOut>
    </section>
  )
}
