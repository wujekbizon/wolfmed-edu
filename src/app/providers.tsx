'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'
import { NavigationGuardProvider } from 'next-navigation-guard';

export default function Providers({ children }: { children: React.ReactNode }) {
  const [client] = useState(new QueryClient())

  return (
    <QueryClientProvider client={client}>
      <NavigationGuardProvider>
        {children}
      </NavigationGuardProvider>
    </QueryClientProvider>)
}
