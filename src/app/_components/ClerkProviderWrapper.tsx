import { ClerkProvider } from '@clerk/nextjs'
import { plPL } from '@clerk/localizations'

interface ClerkProviderWrapperProps {
  children: React.ReactNode
}

export default function ClerkProviderWrapper({ children }: ClerkProviderWrapperProps) {
  return (
    <ClerkProvider
      localization={plPL}
      appearance={{
        variables: {
          colorBackground: 'white',
          colorInputBackground: '#ffb1b1',
          colorText: '#09090a',
          colorShimmer: '#e8b8b1',
        },
      }}
      afterSignOutUrl="/sign-in"
    >
      {children}
    </ClerkProvider>
  )
}
