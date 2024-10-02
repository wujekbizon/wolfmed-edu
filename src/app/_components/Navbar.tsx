'use client'
import { navLinks } from '@/constants/navLinks'
import { useStore } from '@/store/useStore'
import Link from 'next/link'
import SideMenu from './SideMenu'
import Logo from '@/components/Logo'
import MenuIcon from '@/components/icons/MenuIcon'
import AuthSection from '@/components/AuthSection'

export default function Navbar() {
  const { isMenuOpen, toggleMenu } = useStore((state) => state)

  return (
    <header className="relative h-16 w-full z-10 flex items-center justify-between animate-slideInDown opacity-0 [--slidein-delay:100ms] px-4 sm:px-6 pt-2 pb-2.5 sm:pt-4">
      <MenuIcon onClick={toggleMenu} />
      <Logo />
      {isMenuOpen && <SideMenu />}
      <nav className="bg-white py-[8px] px-8 hidden lg:flex gap-6 items-center rounded-full border-red-200/40 shadow-sm shadow-zinc-500">
        {navLinks.map((link) => (
          <Link href={link.linkUrl} key={link.id}>
            <p className="text-base  text-zinc-900 hover:text-[#ffa5a5] transition-colors">{link.label}</p>
          </Link>
        ))}
      </nav>
      <AuthSection />
    </header>
  )
}
