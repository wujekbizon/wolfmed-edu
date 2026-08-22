import { startTransition, useActionState } from 'react'
import { Show, SignInButton, UserButton, useUser } from '@clerk/nextjs'
import { CreditCard } from 'lucide-react'
import { createBillingPortalSession } from '@/actions/stripe'
import { EMPTY_FORM_STATE } from '@/constants/formState'
import { useToastMessage } from '@/hooks/useToastMessage'
import { AuthButton } from './AuthButton'
import LoginIcon from './icons/LoginIcon'

export default function AuthSection() {
  const { isLoaded } = useUser()
  const [billingState, openBillingPortal] = useActionState(
    createBillingPortalSession,
    EMPTY_FORM_STATE
  )
  const noScriptFallback = useToastMessage(billingState)

  const handleBillingClick = () => {
    startTransition(() => openBillingPortal(new FormData()))
  }

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
      <Show when="signed-out">
        <div className="flex gap-2">
          <SignInButton mode="modal">
            <AuthButton>
              <LoginIcon width={28} height={28} />
            </AuthButton>
          </SignInButton>
        </div>
      </Show>
      <Show when="signed-in">
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
          >
            <UserButton.MenuItems>
              <UserButton.Action
                label="Plan i płatności"
                labelIcon={<CreditCard size={16} />}
                onClick={handleBillingClick}
              />
            </UserButton.MenuItems>
          </UserButton>
          {noScriptFallback}
        </div>
      </Show>
    </>
  )
}
