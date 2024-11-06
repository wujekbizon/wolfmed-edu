'use client'
import { navLinks } from '@/constants/navLinks'
import { useStore } from '@/store/useStore'
import { useScroll } from '@/hooks/useScroll'
import Link from 'next/link'
import SideMenu from './SideMenu'
import Logo from '@/components/Logo'
import MenuIcon from '@/components/icons/MenuIcon'
import AuthSection from '@/components/AuthSection'
import GradientOverlay from '@/components/GradientOverlay'
import { usePathname } from 'next/navigation'
import { SignedIn } from '@clerk/nextjs'

export default function Navbar() {
  const { isMenuOpen, toggleMenu } = useStore((state) => state)
  const { isScrolled } = useScroll(20)
  const pathname = usePathname()

  return (
    <>
      {isMenuOpen && <SideMenu />}
      <header
        className={`${
          pathname === '/' ? 'bg-white' : 'bg-transparent'
        } h-16 w-full z-10 flex overflow-hidden items-center justify-between px-4 sm:px-6 pt-2 pb-2.5 sm:pt-4 animate-slideInDown opacity-0 [--slidein-delay:100ms] transition-all duration-300}
          ${
            pathname === '/' && isScrolled
              ? 'bg-white/50 backdrop-blur-sm shadow-sm sticky top-0'
              : 'rounded-tr-[20px] lg:rounded-tr-[47px] rounded-tl-[20px] lg:rounded-tl-[47px]'
          }`}
      >
        {pathname === '/' && <GradientOverlay />}

        <SignedIn>
          <MenuIcon onClick={toggleMenu} />
        </SignedIn>
        <Logo className={pathname === '/' ? 'bg-white' : 'bg-[#ffb1b1]'} />
        <SignedIn>
          <nav className="bg-white/90 backdrop-blur-sm py-1 px-1 hidden lg:flex gap-1 items-center rounded-full border border-red-200/40 shadow-sm shadow-zinc-500/20 z-10">
            {navLinks.map((link) => (
              <Link
                href={link.linkUrl}
                key={link.id}
                className={`relative flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 group
                  ${
                    pathname === link.linkUrl
                      ? 'bg-gradient-to-r from-[#f58a8a]/90 to-[#ffc5c5]/90 shadow-sm'
                      : 'hover:bg-red-100/50'
                  }`}
              >
                <span
                  className={`transition-transform duration-200 ${
                    pathname === link.linkUrl ? 'scale-105' : 'group-hover:scale-105'
                  }`}
                >
                  {link.icon}
                </span>
                <span
                  className={`text-sm font-medium text-zinc-900 ${pathname === link.linkUrl ? 'font-semibold' : ''}`}
                >
                  {link.label}
                </span>
                {pathname === link.linkUrl && (
                  <span className="absolute inset-0 rounded-full bg-gradient-to-r from-[#f58a8a]/10 to-[#ffc5c5]/10 animate-pulse" />
                )}
              </Link>
            ))}
          </nav>
        </SignedIn>
        <AuthSection />
      </header>
    </>
  )
}
