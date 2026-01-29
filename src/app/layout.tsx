import '@/styles/globals.css'
import "@excalidraw/excalidraw/index.css";


import type { Metadata } from 'next'
import { Open_Sans, Poppins } from 'next/font/google'
import Navbar from './_components/Navbar'
import Providers from './providers'
import ToastProvider from './_components/ToastProvider'
import ClerkProviderWrapper from './_components/ClerkProviderWrapper'
import ConditionalGoogleAnalytics from './_components/ConditionalGoogleAnalytics'
import { CookieConsentBanner } from './_components/cookies'
import GoogleAnalytics from './_components/GoogleAnalytics';
import GoogleAnalyticsNoscript from './_components/GoogleAnalyticsNoscript';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['200','400', '600', '800'],
})

const openSans = Open_Sans({
  subsets: ['latin'],
  weight: ['400', '600', '800'],
})

export const metadata: Metadata = {
  title: 'Wolfmed Edukacja - Innowacyjna platforma edukacyjna',
  description: 'Edukacja medyczna, testy opiekuna medycznego i kursy',
  keywords: 'edukacja, opiekun, testy, kursy, egzamin, szkolenie-zawodowe, medyczna',
  authors: { name: 'WESA', url: 'https://wesa.vercel.app/' },
  creator: 'WESA',
  category: 'education',
  robots: {
    index: true,
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
    <ClerkProviderWrapper>
      <html lang="pl">
        <head>
          <link rel="canonical" href="https://wolfmed-edukacja.pl/" />
          <GoogleAnalytics />
        </head>
        <body className={`${poppins.className} bg-[#fcf2f1] scrollbar-webkit`}>
        <GoogleAnalyticsNoscript/>
          <main>
            <Providers>
              <Navbar />
              <ToastProvider>{children}</ToastProvider>
            </Providers>
          </main>
          <CookieConsentBanner />
        </body>
      </html>
    </ClerkProviderWrapper>
  )
}
