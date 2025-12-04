import { SignIn } from '@clerk/nextjs'

export default function Page() {
  return (
    <section className="flex h-[calc(100vh-80px)] w-full items-center justify-center">
      <SignIn path="/sign-in" forceRedirectUrl="/" />
    </section>
  )
}
