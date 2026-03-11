'use client'

import CloseIcon from '@/components/icons/Close'
import { navLinks } from '@/constants/navLinks'
import { sideMenuNavigationLinks } from '@/constants/sideMenuLinks'
import { useStore } from '@/store/useStore'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function SideMenu() {
  const { isMenuOpen, toggleMenu } = useStore((state) => state)
  const pathname = usePathname()

  return (
    <>
      {/* Backdrop overlay — click to close */}
      <div
        onClick={toggleMenu}
        className={`fixed inset-0 z-40 bg-zinc-950/40 backdrop-blur-[2px] transition-opacity duration-300
          ${isMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      />

      {/* Slide-in panel from right */}
      <aside
        className={`fixed z-50 right-0 top-0 h-full w-[min(85vw,380px)]
          bg-gradient-to-br from-white/60 to-rose-50/50 backdrop-blur-xl
          border-l border-white/50 shadow-2xl shadow-zinc-950/20
          flex lg:hidden flex-col
          transition-transform duration-300 ease-in-out
          ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* Header — logo + close */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/40">
          <Link href="/" onClick={toggleMenu} className="flex items-center gap-3">
            <div className="w-10 h-10 bg-zinc-200 rounded-full border border-zinc-300 overflow-hidden shrink-0">
              <Image
                src="https://utfs.io/a/zw3dk8dyy9/UVAwLrIxs2k5UOm8ArIxs2k5EyuGdN4SRigYP6qreJDvtVZl"
                alt="Wolfmed logo"
                width={40}
                height={40}
                className="h-full w-full object-cover"
              />
            </div>
            <span className="text-base font-black tracking-wide text-zinc-900">
              WOLFMED <span className="font-normal text-zinc-500">EDUKACJA</span>
            </span>
          </Link>
          <CloseIcon onClick={toggleMenu} />
        </div>

        <nav className="flex flex-col flex-1 overflow-y-auto px-4 py-5 gap-6">
          {/* Main nav */}
          <div>
            <h3 className="text-xs font-semibold tracking-widest text-rose-400 uppercase mb-3 px-1">
              Menu główne
            </h3>
            <div className="space-y-1">
              {navLinks.map((link) => (
                <Link
                  onClick={toggleMenu}
                  href={link.linkUrl}
                  key={link.id}
                  className={`group w-full px-4 py-3 flex items-center gap-3 rounded-xl border
                    transition-all duration-200
                    ${
                      pathname === link.linkUrl
                        ? 'bg-gradient-to-r from-rose-400/30 to-red-300/20 border-rose-300/50 shadow-sm'
                        : 'bg-white/20 border-white/30 hover:bg-white/40 hover:border-white/55 hover:shadow-sm'
                    }`}
                >
                  <span className="text-zinc-700 transition-transform duration-200 group-hover:scale-110 shrink-0">
                    {link.icon}
                  </span>
                  <span className="text-base font-medium text-zinc-900">{link.label}</span>
                  {pathname === link.linkUrl && (
                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0" />
                  )}
                </Link>
              ))}
            </div>
          </div>

          {/* Panel links grid */}
          <div>
            <h3 className="text-xs font-semibold tracking-widest text-rose-400 uppercase mb-3 px-1">
              Panel użytkownika
            </h3>
            <div className="grid grid-cols-2 gap-2.5">
              {sideMenuNavigationLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.url}
                  onClick={toggleMenu}
                  className={`group flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border
                    transition-all duration-200
                    ${
                      pathname === link.url
                        ? 'bg-gradient-to-br from-rose-400/30 to-red-300/20 border-rose-300/50 shadow-md shadow-rose-200/30'
                        : 'bg-white/30 backdrop-blur-xl border-white/50 shadow-sm shadow-black/5 hover:bg-white/45 hover:border-white/65 hover:shadow-md hover:shadow-black/10'
                    }`}
                >
                  <span className="transition-transform duration-200 group-hover:scale-110 text-zinc-700">
                    {link.icon}
                  </span>
                  <span className="text-xs font-medium text-zinc-900 text-center leading-tight">
                    {link.label}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </nav>

        {/* Footer line */}
        <div className="px-5 py-4 border-t border-white/40">
          <p className="text-xs text-zinc-400 text-center tracking-wide">© 2026 Wolfmed-Edukacja</p>
        </div>
      </aside>
    </>
  )
}
