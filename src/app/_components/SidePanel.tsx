'use client'

import { useEffect } from 'react'
import { useStore } from '@/store/useStore'
import { usePathname } from 'next/navigation'
import { motion, useAnimationControls } from 'framer-motion'
import { containerVariants, svgVariants } from '@/animations/motions'
import Image from 'next/image'
import { sideMenuNavigationLinks } from '@/constants/sideMenuLinks'
import CustomButton from '@/components/CustomButton'

export default function SidePanel() {
  const { isSidePanelOpen, toggleSidePanel } = useStore((state) => state)
  const containerControls = useAnimationControls()
  const svgControls = useAnimationControls()
  const pathname = usePathname()

  useEffect(() => {
    if (isSidePanelOpen) {
      containerControls.start('open')
      svgControls.start('open')
    } else {
      containerControls.start('close')
      svgControls.start('close')
    }
  }, [isSidePanelOpen])

  return (
    <motion.nav
      variants={containerVariants}
      animate={containerControls}
      initial="close"
      //@ts-ignore
      className="z-10 hidden h-full min-w-20 flex-col gap-20 border rounded-xl rounded-bl-[42px] text-zinc-900 p-5 lg:flex border-red-200/60 bg-[#ffb1b1] shadow-md shadow-zinc-500"
    >
      <div className="flex w-full flex-row place-items-center justify-between gap-0.5">
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
            className="h-8 w-8 stroke-zinc-800"
          >
            <motion.path
              strokeLinecap="round"
              strokeLinejoin="round"
              variants={svgVariants}
              animate={svgControls}
              d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
              transition={{
                duration: 0.5,
                ease: 'easeInOut',
              }}
            />
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
    </motion.nav>
  )
}
