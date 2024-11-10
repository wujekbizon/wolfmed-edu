import { ClerkProvider } from '@clerk/nextjs'
import { plPL } from '@clerk/localizations'
// import { headers } from 'next/headers'

interface ClerkProviderWrapperProps {
  children: React.ReactNode
}

export default function ClerkProviderWrapper({ children }: ClerkProviderWrapperProps) {
  // const nonce = await headers().then((headers) => headers.get('x-nonce') ?? '')

  return (
    <ClerkProvider
      // nonce={nonce}
      localization={plPL}
      appearance={{
        variables: {
          colorBackground: 'white',
          colorInputBackground: '#ffb1b1',
          colorText: '#09090a',
          colorShimmer: '#e8b8b1',
        },
      }}
    >
      {children}
    </ClerkProvider>
  )
}
