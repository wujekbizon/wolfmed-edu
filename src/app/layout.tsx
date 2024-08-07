import type { Metadata } from 'next'
import { Poppins } from 'next/font/google'
import './globals.css'
import Navbar from './_components/Navbar'

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '600', '800'],
})

export const metadata: Metadata = {
  title: 'WolfMed',
  description: 'Edukacja medyczna, testy opiekuna medycznego i kursy',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pl">
      <body className={`${poppins.className} bg-[#fcf2f1] p-2 sm:p-6 scrollbar-webkit`}>
        <main className="flex flex-col shadow-lg shadow-zinc-400 bg-gradient-to-t from-[rgb(245,212,207)] to-[rgb(232, 184, 177)] px-4 sm:px-8 py-4 sm:py-6 border-[3px] rounded-3xl sm:rounded-[50px] border-white">
          <Navbar />
          {children}
        </main>
      </body>
    </html>
  )
}
