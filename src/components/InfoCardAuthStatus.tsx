'use client'

import Link from 'next/link'
import { SignedIn, SignedOut, SignInButton } from '@clerk/nextjs'
import type { TestCardContent } from '@/constants/testsCardContent'

export default function InfoCardAuthStatus({ card }: { card: TestCardContent }) {
  return (
    <>
      <SignedIn>
        <div className="rounded-full bg-red-900/10 px-3 sm:px-4 py-1 sm:py-1.5 text-xs sm:text-sm font-medium text-red-200 hover:bg-red-900/20 transition-colors duration-300">
          <Link href={card.link} className="cursor-pointer hover:text-white transition-colors duration-300">
            Kliknij aby otworzyć
          </Link>
        </div>
      </SignedIn>
      <SignedOut>
        <div className="rounded-full bg-zinc-800/50 px-3 sm:px-4 py-1 sm:py-1.5 text-xs sm:text-sm font-medium text-zinc-400">
          <SignInButton mode="modal">Zaloguj się</SignInButton>
        </div>
      </SignedOut>
    </>
  )
}
