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
          colorInput: '#ffb1b1',
          colorForeground: '#09090a',
          colorShimmer: '#e8b8b1',
        },
      }}
      afterSignOutUrl="/sign-in"
    >
      {children}
    </ClerkProvider>
  );
}
