import '@/styles/globals.css'

import type { Metadata } from 'next'
import { Poppins } from 'next/font/google'
import Navbar from './_components/Navbar'
import Providers from './providers'
import { ClerkProvider } from '@clerk/nextjs'
import { plPL } from '@clerk/localizations'
import ToastProvider from './_components/ToastProvider'
import GoogleAnalytics from './_components/GoogleAnalytics'

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '600', '800'],
})

export const metadata: Metadata = {
  title: 'Wolfmed Edukacja',
  description: 'Edukacja medyczna, testy opiekuna medycznego i kursy',
  keywords: 'edukacja, opiekun, testy, kursy, egzamin, szkolenie-zawodowe, medyczna',
  authors: { name: 'WESA', url: 'https://wesa.vercel.app/' },
  creator: 'WESA',
  robots: {
    index: false,
    follow: true,
    nocache: true,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    title: 'Wolfmed Edukacja',
    description: 'Edukacja medyczna, testy opiekuna medycznego i kursy',
    url: 'https://wolfmed-edukacja.pl/',
    siteName: 'Wolfmed Edukacja',
    locale: 'pl_PL',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
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
    >
      <html lang="pl">
        <GoogleAnalytics />
        <body className={`${poppins.className} bg-[#fcf2f1] scrollbar-webkit`}>
          <main className="shadow-lg shadow-zinc-400 bg-gradient-to-t from-[rgb(245,212,207)] to-[#e8b8b1] border-[3px] rounded-3xl sm:rounded-[50px] border-white">
            <Navbar />
            <Providers>
              <ToastProvider>{children}</ToastProvider>
            </Providers>
          </main>
        </body>
      </html>
    </ClerkProvider>
  )
}
