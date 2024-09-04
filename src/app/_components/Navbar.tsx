'use client'
import { navLinks } from '@/constants/navLinks'
import { useStore } from '@/store/useStore'
import Image from 'next/image'
import Link from 'next/link'
import SideMenu from './SideMenu'
import Logo from '@/components/Logo'
import { ClerkLoading, SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs'

export default function Navbar() {
  const { isMenuOpen, toggleMenu } = useStore((state) => state)

  return (
    <header className="h-16 w-full z-10 flex items-center justify-between relative animate-slideInDown opacity-0 [--slidein-delay:100ms] px-4 sm:px-6 pt-2 pb-2.5 sm:pt-4">
      <Logo />
      <Image
        src="/hamburger.png"
        alt="menu"
        width={32}
        height={32}
        className="inline-block lg:hidden cursor-pointer"
        onClick={toggleMenu}
      />

      {isMenuOpen && <SideMenu />}

      <nav className="bg-white py-[10px] px-4 hidden lg:flex gap-5 items-center rounded-full border-red-300/50 shadow-sm shadow-zinc-400">
        {navLinks.map((link) => (
          <Link href={link.linkUrl} key={link.id}>
            <p className="text-sm font-semibold text-zinc-900 hover:text-[#ffa5a5] transition-colors">{link.label}</p>
          </Link>
        ))}
      </nav>
      <div className="hidden lg:flex items-center gap-3">
        <ClerkLoading>Sign in</ClerkLoading>
        <SignedOut>
          {/* <Link
            href="/sign-in"
            className="bg-white border border-red-300/50 shadow-sm hover:text-[#ffa5a5] shadow-zinc-400 text-sm font-semibold py-[9px] px-4 rounded-full text-zinc-900 hover:bg-[#ffffff] transition-colors"
          >
            Zaloguj się
          </Link>
          <Link
            href="/sign-up"
            className="bg-[#ffb1b1] hover:text-[#fffcfc] border border-red-100/50 shadow-sm shadow-zinc-400 text-sm font-semibold py-[9px] px-4 rounded-full hover:bg-[#ffa5a5] transition-colors text-zinc-900"
          >
            Wypróbuj za darmo
          </Link> */}
          <SignInButton mode="modal">
            <button className="bg-white border border-red-300/50 shadow-sm hover:text-[#ffa5a5] shadow-zinc-400 text-sm font-semibold py-[9px] px-4 rounded-full text-zinc-900 hover:bg-[#ffffff] transition-colors">
              Zaloguj się
            </button>
          </SignInButton>
        </SignedOut>
        <SignedIn>
          <UserButton afterSwitchSessionUrl="/" />
        </SignedIn>
      </div>
    </header>
  )
}
