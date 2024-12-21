import CloseIcon from '@/components/icons/Close'
import { navLinks } from '@/constants/navLinks'
import { sideMenuNavigationLinks } from '@/constants/sideMenuLinks'
import { useStore } from '@/store/useStore'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function SideMenu() {
  const { isMenuOpen, toggleMenu } = useStore((state) => state)
  const pathname = usePathname()

  return (
    <aside
      className={`fixed z-50 overflow-y-scroll h-screen left-0 top-0 w-[calc(100vw)] bg-gradient-to-b from-zinc-900/95 to-zinc-950/95 
        backdrop-blur-sm border-r border-red-300/20 shadow-xl shadow-zinc-950/20 flex lg:hidden flex-col 
        transition-transform duration-300 ease-in-out ${isMenuOpen ? 'translate-x-[0%]' : 'translate-x-[140%]'}`}
    >
      <div className="flex justify-end p-5">
        <CloseIcon onClick={toggleMenu} />
      </div>

      <nav className="flex flex-col h-full px-5 pb-8">
        {/* Main Navigation */}
        <div>
          <h3 className="text-red-200 text-sm font-medium mb-3 px-1">Menu główne</h3>
          <div className="space-y-3">
            {navLinks.map((link) => (
              <Link
                onClick={toggleMenu}
                href={link.linkUrl}
                key={link.id}
                className={`group w-full p-4 flex items-center gap-4 rounded-xl border transition-all duration-200
                  ${
                    pathname === link.linkUrl
                      ? 'bg-gradient-to-r from-[#f58a8a] to-[#ffc5c5] border-red-200/60 shadow-lg'
                      : 'bg-[#ffc5c5] border-red-200/40 hover:bg-[#f58a8a] hover:shadow-md'
                  }`}
              >
                <span className="text-zinc-900 transition-transform duration-200 group-hover:scale-110">
                  {link.icon}
                </span>
                <span className="text-lg font-medium text-zinc-900">{link.label}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Dashboard Navigation */}
        <div className="mt-16">
          <h3 className="text-red-200 text-sm font-medium mb-3 px-1">Panel użytkownika</h3>
          <div className="grid grid-cols-2 gap-3">
            {sideMenuNavigationLinks.map((link) => (
              <Link
                key={link.label}
                href={link.url}
                onClick={toggleMenu}
                className={`group flex flex-col items-center justify-center p-4 rounded-xl border
                  transition-all duration-200 ${
                    pathname === link.url
                      ? 'bg-gradient-to-r from-[#f58a8a] to-[#ffc5c5] border-red-200/60 shadow-lg'
                      : 'bg-[#ffc5c5] border-red-200/40 hover:bg-[#f58a8a] hover:shadow-md'
                  }`}
              >
                <span className="transition-transform duration-200 group-hover:scale-110">{link.icon}</span>
                <span className="mt-2 text-sm font-medium text-zinc-900 text-center">{link.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </nav>
    </aside>
  )
}
