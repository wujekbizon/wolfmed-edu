import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton, useUser } from '@clerk/nextjs'
import { AuthButton } from './AuthButton'

import LoginIcon from './icons/LoginIcon'

export default function AuthSection() {
  const { isLoaded } = useUser()

  if (!isLoaded) {
    return (
      <div className="flex gap-2">
        <AuthButton isPlaceholder>
          <LoginIcon width={28} height={28} />
        </AuthButton>
      </div>
    )
  }
  return (
    <>
      <SignedOut>
        <div className="flex gap-2">
          <SignInButton mode="modal">
            <AuthButton>
              <LoginIcon width={28} height={28} />
            </AuthButton>
          </SignInButton>
        </div>
      </SignedOut>
      <SignedIn>
        <div className="w-[130px] flex justify-end">
          <UserButton
            afterSwitchSessionUrl="/"
            appearance={{
              elements: {
                userButtonAvatarBox: {
                  width: 40,
                  height: 40,
                },
              },
            }}
          />
        </div>
      </SignedIn>
    </>
  )
}
