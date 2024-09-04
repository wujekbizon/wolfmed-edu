import { SignIn } from '@clerk/nextjs'

export default function Page() {
  return (
    <section className="flex h-[calc(100vh_-_86px)] sm:h-[calc(100vh_-_110px)] w-full items-center justify-center">
      <SignIn path="/sign-in" forceRedirectUrl="/" />
    </section>
  )
}
