import { SignUp } from '@clerk/nextjs'

export default function Page() {
  return (
    <div className="flex h-[calc(100vh_-_86px)] sm:h-[calc(100vh_-_110px)] w-full items-center justify-center">
      <SignUp path="/sign-up" forceRedirectUrl="/dashboard" />
    </div>
  )
}
