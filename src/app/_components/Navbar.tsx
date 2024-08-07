'use client'
import { navLinks } from '@/constants/navLinks'
import { useStore } from '@/store/useStore'
import Image from 'next/image'
import Link from 'next/link'
import SideMenu from './SideMenu'

export default function Navbar() {
  const { isMenuOpen, toggleMenu } = useStore((state) => state)

  return (
    <header className="h-16 w-full z-10 flex items-center justify-between relative animate-slideInDown opacity-0 [--slidein-delay:100ms]">
      <div className="flex gap-2 h-10 items-center">
        <div className="h-12 w-12">
          <Image
            className="h-full w-full object-cover"
            src="/blood-test.png"
            alt="blood vial"
            width={100}
            height={100}
          />
        </div>
        <div className="flex flex-col justify-around h-10 ">
          <h3 className="text-base font-extrabold leading-3 tracking-wide text-zinc-900">WOLFMED</h3>
          <h3 className="text-sm font-bold text-zinc-600 leading-3">EDUKACJA</h3>
        </div>
      </div>
      <Image
        src="/hamburger.png"
        alt="menu"
        width={32}
        height={32}
        className="inline-block lg:hidden cursor-pointer"
        onClick={toggleMenu}
      />

      {isMenuOpen && <SideMenu />}

      <nav className="bg-[#fffcfc] py-[13px] px-4 hidden lg:flex gap-5 items-center rounded-full border-red-300/50 shadow-sm shadow-zinc-300">
        {navLinks.map((link) => (
          <Link href={link.linkUrl} key={link.id}>
            <p className="text-sm font-semibold text-zinc-900 hover:text-[#ffa5a5] transition-colors">{link.label}</p>
          </Link>
        ))}
      </nav>
      <div className="hidden lg:flex items-center gap-3">
        <button className="bg-[#fffcfc] border border-red-300/50 shadow-sm hover:text-[#ffa5a5] shadow-zinc-300 text-sm font-semibold py-3 px-4 rounded-full text-zinc-900 hover:bg-[#ffffff] transition-colors">
          Zaloguj się
        </button>
        <button className="bg-[#ffb1b1] hover:text-[#fffcfc] border border-red-100/50 shadow-sm shadow-zinc-300 text-sm font-semibold py-3 px-4 rounded-full hover:bg-[#ffa5a5] transition-colors text-zinc-900">
          Wypróbuj
        </button>
      </div>
    </header>
  )
}
