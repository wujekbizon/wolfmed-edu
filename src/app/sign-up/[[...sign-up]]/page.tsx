import { SignUp } from '@clerk/nextjs'

export default function Page() {
  return (
    <div className="flex h-[calc(100vh_-_70px)] w-full items-center justify-center">
      <SignUp path="/sign-up" forceRedirectUrl="/" />
    </div>
  )
}
