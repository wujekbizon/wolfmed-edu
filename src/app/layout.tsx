import type { Metadata } from 'next'
import { Poppins } from 'next/font/google'
import './globals.css'
import Navbar from './_components/Navbar'
import Providers from './providers'

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '600', '800'],
})

export const metadata: Metadata = {
  title: 'Wolfmed Edukacja',
  description: 'Edukacja medyczna, testy opiekuna medycznego i kursy',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pl">
      <body className={`${poppins.className} bg-[#fcf2f1] p-2 sm:p-5 scrollbar-webkit`}>
        <main className="shadow-lg shadow-zinc-400 bg-gradient-to-t from-[rgb(245,212,207)] to-[#e8b8b1] border-[3px] rounded-3xl sm:rounded-[50px] border-white">
          <Navbar />
          <Providers>{children}</Providers>
        </main>
      </body>
    </html>
  )
}
