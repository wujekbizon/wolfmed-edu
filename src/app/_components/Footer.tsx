import FacebookIcon from '@/components/icons/FacebookIcon'
import LinkedInIcon from '@/components/icons/LinkedInIcon'
import XIcon from '@/components/icons/XIcon'
import { navLinks } from '@/constants/navLinks'
import Image from 'next/image'

import Link from 'next/link'

export default function Footer() {
  return (
    <section className="h-[70vh] bg-zinc-200 bg-[url('/footer.jpg')] bg-cover bg-blend-difference bg-center w-full rounded-br-3xl rounded-bl-3xl sm:rounded-br-[50px] sm:rounded-bl-[50px]">
      <div className="w-full h-full flex flex-col justify-between">
        <div className="flex gap-4 justify-center items-center border border-red-200/40 bg-[#ffb1b1]/80 rounded-lg shadow-md shadow-zinc-500 w-[90%] lg:2/3 xl:w-3/4 py-1 px-4 place-self-center mt-8">
          <div className="hidden sm:flex items-center justify-center h-12 w-12 md:h-20 md:w-20 bg-white rounded-full">
            <Image
              className="h-[85%] w-[85%] object-cover"
              src="/blood-test.png"
              alt="blood vial"
              width={280}
              height={280}
              priority
            />
          </div>
          <div className="flex text-2xl xs:text-3xl md:text-5xl flex-row items-center h-full gap-3">
            <h3 className="font-bold tracking-wide text-zinc-900">WOLFMED</h3>
            <h3 className="font-medium text-zinc-500">EDUKACJA</h3>
          </div>
        </div>
        <div className="w-[90%] lg:w-1/2 h-3/4 gap-5 sm:h-full flex-col place-self-center flex items-center justify-evenly sm:justify-evenly">
          <div className="flex flex-col gap-4 h-full w-full justify-center">
            {' '}
            {navLinks.map((link) => (
              <Link
                className="py-2 text-center w-full shadow shadow-zinc-500 bg-zinc-400/40 hover:bg-zinc-100/80 rounded  text-zinc-900 font-semibold hover:text-[#ff7c7c] transition-colors text-2xl"
                key={link.id}
                href={link.linkUrl}
              >
                {link.label}
              </Link>
            ))}
          </div>
          <div className="flex flex-col items-center justify-center gap-3">
            <p className="text-sm text-zinc-50 font-semibold">Znajdż nas w sieci.</p>
            <div className="flex flex-row items-center justify-between w-full pb-8">
              <Link
                className="hover:bg-zinc-100/80 shadow shadow-zinc-500 bg-zinc-400/40 p-1 rounded"
                href="https://www.linkedin.com/in/grzegorz-wolfinger-b88856229/"
              >
                <FacebookIcon />
              </Link>
              <Link
                className="hover:bg-zinc-100/80 shadow shadow-zinc-500 bg-zinc-400/40 p-1 rounded"
                href="https://www.facebook.com"
              >
                <LinkedInIcon />
              </Link>
              <Link
                className="hover:bg-zinc-100/80 shadow shadow-zinc-500 bg-zinc-400/40 p-1 rounded"
                href="https://x.com/home"
              >
                <XIcon />
              </Link>
            </div>
          </div>
        </div>
        <div className="bg-[#ffa5a5]/90 rounded-br-3xl rounded-bl-3xl flex flex-col xs:flex-row items-center justify-center xs:justify-between sm:rounded-br-[50px] sm:rounded-bl-[50px] h-14 xs:h-20 px-2 sm:px-8">
          <p className="text-base text-zinc-800">
            © 2024
            <span className="font-semibold"> Wolfmed-Edukacja</span>
          </p>
          <Link target="_blank" href="https://wesa.vercel.app/" className="">
            © Designed by <span className="font-bold text-[#ff5b5b] hover:text-white transition-colors">WESA</span>
          </Link>
        </div>
      </div>
    </section>
  )
}
