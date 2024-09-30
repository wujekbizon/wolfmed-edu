import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton, useUser } from '@clerk/nextjs'
import { AuthButton } from './AuthButton'

export default function AuthSection() {
  const { isLoaded } = useUser()

  if (!isLoaded) {
    return (
      <div className="flex gap-2">
        <AuthButton text="Rejestracja" isPlaceholder />
        <AuthButton text="Zaloguj się" isPlaceholder />
      </div>
    )
  }

  return (
    <>
      <SignedOut>
        <div className="flex gap-2">
          <SignUpButton mode="modal">
            <AuthButton text="Rejestracja" />
          </SignUpButton>
          <SignInButton mode="modal">
            <AuthButton text="Zaloguj się" />
          </SignInButton>
        </div>
      </SignedOut>
      <SignedIn>
        <div className="w-[230px] flex justify-end">
          <UserButton
            afterSwitchSessionUrl="/"
            appearance={{
              elements: { userButtonAvatarBox: { width: 40, height: 40 } },
            }}
          />
        </div>
      </SignedIn>
    </>
  )
}
