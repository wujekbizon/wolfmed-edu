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

        <MenuIcon onClick={toggleMenu} />
        <Logo className={pathname === '/' ? 'bg-white' : 'bg-[#ffb1b1]'} />
        <nav className="bg-white py-[8px] px-8 hidden lg:flex gap-6 items-center rounded-full border-red-200/40 shadow-sm shadow-zinc-500 z-10">
          {navLinks.map((link) => (
            <Link href={link.linkUrl} key={link.id}>
              <p className="text-base font-semibold text-zinc-900 hover:text-[#ffa5a5] transition-colors">
                {link.label}
              </p>
            </Link>
          ))}
        </nav>
        <AuthSection />
      </header>
    </>
  )
}
