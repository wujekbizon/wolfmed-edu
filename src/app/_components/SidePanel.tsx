'use client'

import { useStore } from '@/store/useStore'
import { usePathname } from 'next/navigation'
import Image from 'next/image'
import { sideMenuNavigationLinks } from '@/constants/sideMenuLinks'
import CustomButton from '@/components/CustomButton'

export default function SidePanel() {
  const { isSidePanelOpen, toggleSidePanel } = useStore((state) => state)
  const pathname = usePathname()

  return (
    <nav
      // Use Tailwind CSS classes for animation
      className={`z-10 hidden h-full min-w-20 flex-col gap-20 border rounded-xl rounded-bl-[42px] text-zinc-900 p-5 lg:flex border-red-200/60 bg-[#ffb1b1] shadow-md shadow-zinc-500 transition-all duration-500 ${
        isSidePanelOpen ? 'w-64' : 'w-20'
      }`}
    >
      <div className="flex w-full flex-row place-items-center justify-between gap-1">
        <div className="h-10 w-10 bg-white rounded-full flex justify-center items-center border-red-300/50 shadow-sm shadow-zinc-400">
          <Image
            className="h-8 w-8 object-cover"
            src="/blood-test.png"
            alt="blood vial"
            width={60}
            height={60}
            priority
          />
        </div>
        <button
          className="flex justify-center bg-[#ffc5c5] items-center pr-0.5 transition-all hover:scale-95 rounded-md border border-red-100/50 hover:border-zinc-900 hover:shadow-sm hover:bg-[#f58a8a] shadow-md shadow-zinc-500"
          onClick={toggleSidePanel}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1}
            stroke="currentColor"
            className={`h-8 w-8 stroke-zinc-800 transition-transform duration-500 ${
              isSidePanelOpen ? 'rotate-180' : 'rotate-0'
            }`}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
          </svg>
        </button>
      </div>
      <div className="flex flex-col gap-5">
        {sideMenuNavigationLinks.map((navLink) => (
          <CustomButton text={navLink.label} key={navLink.label} href={navLink.url} active={navLink.url === pathname}>
            {navLink.icon}
          </CustomButton>
        ))}
      </div>
    </nav>
  )
}
