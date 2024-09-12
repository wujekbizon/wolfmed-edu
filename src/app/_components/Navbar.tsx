'use client'
import { navLinks } from '@/constants/navLinks'
import { useStore } from '@/store/useStore'
import Link from 'next/link'
import SideMenu from './SideMenu'
import Logo from '@/components/Logo'
import { SignedIn, SignedOut, SignInButton, UserButton, ClerkLoading } from '@clerk/nextjs'
import MenuIcon from '@/components/icons/MenuIcon'

export default function Navbar() {
  const { isMenuOpen, toggleMenu } = useStore((state) => state)

  return (
    <header className="h-16 w-full z-10 flex items-center justify-between relative animate-slideInDown opacity-0 [--slidein-delay:100ms] px-4 sm:px-6 pt-2 pb-2.5 sm:pt-4">
      <MenuIcon onClick={toggleMenu} />
      <Logo />
      {isMenuOpen && <SideMenu />}
      <nav className="bg-white py-[8px] px-8 hidden lg:flex gap-8 items-center rounded-full border-red-200/40 shadow-sm shadow-zinc-500">
        {navLinks.map((link) => (
          <Link href={link.linkUrl} key={link.id}>
            <p className="text-base  text-zinc-900 hover:text-[#ffa5a5] transition-colors">{link.label}</p>
          </Link>
        ))}
      </nav>
      <SignedOut>
        <SignInButton mode="modal">
          <button className="bg-white border border-red-300/50 shadow-sm hover:text-[#ffa5a5] shadow-zinc-400 text-sm font-semibold py-[9px] px-4 rounded-full text-zinc-900 hover:bg-[#ffffff] transition-colors">
            Zaloguj się
          </button>
        </SignInButton>
      </SignedOut>
      <ClerkLoading>
        <div className="w-10 h-10 bg-white opacity-20 border border-[#ffa5a5] rounded-full animate-pulse"></div>
      </ClerkLoading>
      <SignedIn>
        <UserButton
          afterSwitchSessionUrl="/"
          appearance={{
            elements: { userButtonAvatarBox: { width: 40, height: 40 } },
          }}
        />
      </SignedIn>
    </header>
  )
}
