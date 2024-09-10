import CustomButton from '@/components/CustomButton'
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
    <aside
      className={`absolute z-50 h-screen left-[-3px] top-[-3px] p-5 w-screen bg-zinc-950/95 border-red-200/40 shadow-md shadow-zinc-500 flex lg:hidden flex-col transition-transform  ${
        isMenuOpen ? 'translate-x-[0%]' : 'translate-x-[140%]'
      }`}
    >
      <p className="cursor-pointer font-extrabold text-2xl text-zinc-50 hover:text-zinc-500" onClick={toggleMenu}>
        X
      </p>
      <div className="h-full w-full flex flex-col justify-around">
        <div className="grid h-full w-full grid-cols-2 grid-rows-2 gap-5 pt-5 rounded-lg xs:grid-cols-2 ">
          {navLinks.map((link) => (
            <Link
              onClick={toggleMenu}
              href={link.linkUrl}
              key={link.id}
              className="w-full h-full flex items-center bg-[#ffc5c5] hover:scale-95 transition-all border border-red-200/40  hover:bg-[#f58a8a]  hover:border-zinc-800 rounded-lg justify-center"
            >
              <div className="flex items-center justify-center">
                <p className="text-2xl text-zinc-900">{link.label}</p>
              </div>
            </Link>
          ))}
        </div>
        <div className="grid h-full w-full grid-cols-2 grid-rows-3 gap-5 rounded-lg pt-5 xs:grid-cols-2 ">
          {sideMenuNavigationLinks.map((link) => (
            <div
              key={link.label}
              className="flex h-full w-full flex-col items-center justify-center rounded-lg border border-red-200/40 bg-[#ffc5c5] p-2 transition-all hover:scale-95 hover:bg-[#f58a8a]"
            >
              <Link
                href={link.url}
                className="flex h-full w-full flex-col items-center justify-center gap-3"
                onClick={toggleMenu}
              >
                {link.icon}
                <p className="text-center text-base text-zinc-900 md:text-lg ">{link.label}</p>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </aside>
  )
}
