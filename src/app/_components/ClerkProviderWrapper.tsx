import { ClerkProvider } from '@clerk/nextjs'
import { clerkLocalization } from '@/constants/clerkLocalization'

interface ClerkProviderWrapperProps {
  children: React.ReactNode
}

export default function ClerkProviderWrapper({ children }: ClerkProviderWrapperProps) {
  return (
    <ClerkProvider
      localization={clerkLocalization}
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
