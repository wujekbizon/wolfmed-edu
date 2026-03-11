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

      {/* Slide-in panel from LEFT (same side as hamburger button) */}
      <aside
        className={`fixed z-50 left-0 top-0 h-full w-[min(85vw,380px)]
          bg-gradient-to-br from-white/60 to-rose-50/50 backdrop-blur-xl
          border-r border-white/50 shadow-2xl shadow-zinc-950/20
          flex lg:hidden flex-col
          transition-transform duration-300 ease-in-out
          ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}
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
            <h3 className="text-xs font-semibold tracking-widest text-rose-400 uppercase mb-2 px-1">
              Menu główne
            </h3>
            <div className="flex flex-col">
              {navLinks.map((link) => {
                const isActive = pathname === link.linkUrl
                return (
                  <Link
                    onClick={toggleMenu}
                    href={link.linkUrl}
                    key={link.id}
                    className={`group relative flex items-center gap-3.5 px-3 py-3 rounded-xl
                      transition-all duration-200
                      ${isActive
                        ? 'text-rose-600'
                        : 'text-zinc-700 hover:text-zinc-900 hover:bg-white/40'
                      }`}
                  >
                    {/* Active left accent bar */}
                    {isActive && (
                      <span className="absolute left-0 top-2 bottom-2 w-0.5 rounded-full bg-rose-400" />
                    )}

                    {/* Icon container */}
                    <span
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all duration-200
                        ${isActive
                          ? 'bg-gradient-to-br from-rose-400/25 to-red-300/15 shadow-sm shadow-rose-200/40'
                          : 'bg-white/50 border border-white/60 group-hover:bg-white/70 group-hover:shadow-sm'
                        }`}
                    >
                      <span className="transition-transform duration-200 group-hover:scale-110">
                        {link.icon}
                      </span>
                    </span>

                    <span className={`text-sm font-medium ${isActive ? 'font-semibold' : ''}`}>
                      {link.label}
                    </span>
                  </Link>
                )
              })}
            </div>
          </div>

          {/* Panel links grid */}
          <div>
            <h3 className="text-xs font-semibold tracking-widest text-rose-400 uppercase mb-3 px-1">
              Panel użytkownika
            </h3>
            <div className="grid grid-cols-2 gap-2.5">
              {sideMenuNavigationLinks.map((link) => {
                const isActive = pathname === link.url
                return (
                  <Link
                    key={link.label}
                    href={link.url}
                    onClick={toggleMenu}
                    className={`group flex flex-col items-center justify-center gap-2.5 p-4 rounded-2xl
                      border transition-all duration-200
                      ${isActive
                        ? 'bg-gradient-to-br from-rose-400/25 to-red-200/20 border-rose-300/60 shadow-md shadow-rose-200/30'
                        : 'bg-white/30 backdrop-blur-xl border-white/50 shadow-sm shadow-black/5 hover:bg-white/50 hover:border-rose-200/50 hover:shadow-md hover:shadow-rose-100/20'
                      }`}
                  >
                    {/* Icon wrapper with tint */}
                    <span
                      className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-200
                        ${isActive
                          ? 'bg-rose-100/60'
                          : 'bg-white/60 border border-white/70 group-hover:bg-rose-50/60 group-hover:border-rose-100/50'
                        }`}
                    >
                      <span className="transition-transform duration-200 group-hover:scale-110 text-zinc-700">
                        {link.icon}
                      </span>
                    </span>
                    <span className="text-xs font-medium text-zinc-800 text-center leading-tight">
                      {link.label}
                    </span>
                  </Link>
                )
              })}
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
