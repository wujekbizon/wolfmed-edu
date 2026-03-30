'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useStore } from '@/store/useStore'
import { navLinks } from '@/constants/navLinks'
import { sideMenuNavigationLinks } from '@/constants/sideMenuLinks'
import { Settings } from 'lucide-react'
import { useSettingsModalStore } from '@/store/useSettingsModalStore'


export default function NavDrawer() {
  const { isMenuOpen, toggleMenu } = useStore((state) => state)
  const { openSettingsModal } = useSettingsModalStore()
  const pathname = usePathname()

  return (
    <>
      <div
        onClick={toggleMenu}
        className={`fixed inset-0 z-40 bg-zinc-950/40 backdrop-blur-[2px] transition-opacity duration-300
          ${isMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      />
      <aside
        className={`fixed z-100 left-0 top-0 h-full w-[min(85vw,380px)]
          bg-gradient-to-br from-white/60 to-rose-50/50 backdrop-blur-xl
          border-r border-white/50 shadow-2xl shadow-zinc-950/20
          flex lg:hidden flex-col
          transition-transform duration-300 ease-in-out
          ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="h-20 flex items-center justify-between px-5 border-b border-white/40 shrink-0">
          <Link href="/" onClick={toggleMenu} className="flex items-center gap-3">
            <div className="w-10 h-10 bg-zinc-200 rounded-full border border-zinc-400 shrink-0">
              <Image
                src="https://utfs.io/a/zw3dk8dyy9/UVAwLrIxs2k5UOm8ArIxs2k5EyuGdN4SRigYP6qreJDvtVZl"
                alt="Wolfmed logo"
                width={40}
                height={40}
                className="h-full w-full object-cover"
              />
            </div>
            <span className="text-lg font-black tracking-wide text-zinc-900">
              WOLFMED <span className="font-normal text-zinc-500">EDUKACJA</span>
            </span>
          </Link>
        </div>

        <nav className="flex flex-col flex-1 min-h-0 px-4 py-5 gap-6">
          {/* Main nav */}
          <div className="shrink-0">
            <h3 className="text-xs font-semibold tracking-widest text-zinc-800 uppercase mb-2 px-1">
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
                    className={`group relative flex items-center gap-3.5 px-3 py-2 rounded-xl
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

          <div className="flex flex-col flex-1 min-h-0">
            <h3 className="text-xs font-semibold tracking-widest text-zinc-800 uppercase mb-2 px-1 shrink-0">
              Panel użytkownika
            </h3>
            <div className="flex flex-col flex-1 overflow-y-auto [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-zinc-300/60 [&::-webkit-scrollbar-thumb]:rounded-full">
              {sideMenuNavigationLinks.map((link) => {
                const isActive = pathname === link.url
                return (
                  <Link
                    key={link.label}
                    href={link.url}
                    onClick={toggleMenu}
                    className={`group relative flex items-center gap-3.5 px-3 py-2 rounded-xl
                      transition-all duration-200
                      ${isActive
                        ? 'text-rose-600'
                        : 'text-zinc-700 hover:text-zinc-900 hover:bg-white/40'
                      }`}
                  >
                    {isActive && (
                      <span className="absolute left-0 top-2 bottom-2 w-0.5 rounded-full bg-rose-400" />
                    )}
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
        </nav>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-white/40 flex items-center justify-between">
          <p className="text-xs text-zinc-500 tracking-wide">© 2026 Wolfmed-Edukacja</p>
          <button
            onClick={() => { toggleMenu(); openSettingsModal() }}
            className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-800 transition-colors"
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Ustawienia</span>
          </button>
        </div>
      </aside>
    </>
  )
}