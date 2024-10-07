import { SignedIn, SignedOut } from '@clerk/nextjs'
import MembershipPlans from '@/components/MembershipPlans'
import RegisterNow from '@/components/RegisterNow'

export default function Membership() {
  return (
    <section className="bg-gradient-to-b from-zinc-50 to-zinc-800 w-full h-full py-8">
      <SignedIn>
        <MembershipPlans />
      </SignedIn>
      <SignedOut>
        <RegisterNow />
      </SignedOut>
    </section>
  )
}
