import { navLinks } from '@/constants/navLinks'
import { useStore } from '@/store/useStore'
import Image from 'next/image'
import Link from 'next/link'

export default function SideMenu() {
  const { isMenuOpen, toggleMenu } = useStore((state) => state)

  return (
    <aside
      className={`absolute h-[97.8vh] z-50 sm:h-[calc(100vh_-_46px)] left-0 top-0 w-full bg-[#ffb1b1] border-red-300/50 shadow-md shadow-zinc-500 flex lg:hidden flex-col transition-transform rounded-2xl sm:rounded-[47px] p-12 ${
        isMenuOpen ? 'translate-x-[0%]' : 'translate-x-[140%]'
      }`}
    >
      <div className="h-full w-full flex flex-col justify-around">
        <p
          className="absolute right-8 top-4 cursor-pointer font-extrabold text-2xl text-zinc-50 hover:text-zinc-500"
          onClick={toggleMenu}
        >
          X
        </p>
        {navLinks.map((link) => (
          <Link
            onClick={toggleMenu}
            href={link.linkUrl}
            key={link.id}
            className="w-full h-1/6 flex items-center bg-[#ffc5c5] hover:scale-95  transition-all border border-red-200/40 hover:shadow-sm hover:bg-[#f58a8a] shadow-md shadow-zinc-500 hover:border-zinc-800 rounded-xl justify-center"
          >
            <div className="flex items-center justify-center">
              <p className="text-2xl text-zinc-900 font-semibold">{link.label}</p>
            </div>
          </Link>
        ))}
      </div>
    </aside>
  )
}
