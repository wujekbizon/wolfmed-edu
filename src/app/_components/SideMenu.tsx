import { navLinks } from '@/constants/navLinks'
import { useStore } from '@/store/useStore'
import Image from 'next/image'
import Link from 'next/link'

export default function SideMenu() {
  const { isMenuOpen, toggleMenu } = useStore((state) => state)

  return (
    <aside
      className={`absolute h-[95vh] z-50 sm:h-[90vh] left-0 top-0 w-full bg-white border-red-300/50 shadow-md shadow-zinc-400 flex lg:hidden flex-col transition-transform rounded-3xl p-5 ${
        isMenuOpen ? 'translate-x-[0%]' : 'translate-x-[140%]'
      }`}
    >
      <div className="h-full w-full flex flex-col justify-around">
        <Image
          src="/close.png"
          alt="close"
          onClick={toggleMenu}
          width={22}
          height={22}
          className="absolute right-4 top-3 cursor-pointer"
        />
        {navLinks.map((link) => (
          <Link
            onClick={toggleMenu}
            href={link.linkUrl}
            key={link.id}
            className="w-full h-1/5 flex items-center  shadow-md shadow-zinc-400 hover:bg-[#ffb1b1] transition-colors border border-red-100/50 rounded-xl justify-center bg-gradient-to-t from-[rgb(245,212,207)] to-[rgb(236, 167, 157)]"
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
