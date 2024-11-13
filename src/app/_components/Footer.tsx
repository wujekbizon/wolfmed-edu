import FacebookIcon from '@/components/icons/FacebookIcon'
import LinkedInIcon from '@/components/icons/LinkedInIcon'
import XIcon from '@/components/icons/XIcon'
import { navLinks } from '@/constants/navLinks'
import Image from 'next/image'
import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-zinc-100 text-zinc-800 flex w-full h-full justify-center rounded-br-3xl lg:rounded-br-[50px] rounded-bl-3xl lg:rounded-bl-[50px]">
      <div className="container px-4 py-12">
        {/* Logo and tagline */}
        <div className="flex items-center justify-center mb-8 gap-3 flex-col sm:flex-row ">
          <div className="w-14 h-14 bg-zinc-200 rounded-full border justify-center items-center border-zinc-400">
            <Image
              src="https://utfs.io/a/zw3dk8dyy9/UVAwLrIxs2k5UOm8ArIxs2k5EyuGdN4SRigYP6qreJDvtVZl"
              alt="Wolfmed Edukacja logo"
              width={50}
              height={50}
              className="mb-4 w-full h-full object-cover"
              loading="lazy"
            />
          </div>
          <div className="text-center sm:text-left">
            <h3 className="text-2xl font-bold">
              WOLFMED <span className="font-normal text-zinc-500">EDUKACJA</span>
            </h3>
            <p className="text-sm text-zinc-500">Innowacyjne rozwiązania w edukacji medycznej</p>
          </div>
        </div>

        {/* Navigation and legal links */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
          <div className="text-center sm:text-left">
            <h4 className="font-semibold mb-4">Nawigacja</h4>
            <ul className="space-y-2">
              {navLinks.map((link) => (
                <li key={link.id}>
                  <Link href={link.linkUrl} className="hover:text-red-500 transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="text-center sm:text-left">
            <h4 className="font-semibold mb-4">Informacje prawne</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/warunki" className="hover:text-red-500 transition-colors">
                  Warunki Użytkowania
                </Link>
              </li>
              <li>
                <Link href="/polityka-prywatnosci" className="hover:text-red-500 transition-colors">
                  Polityka Prywatności
                </Link>
              </li>
            </ul>
          </div>
          <div className="text-center sm:text-left">
            <h4 className="font-semibold mb-4">Kontakt</h4>
            <a href="mailto:wolfmededu@gmail.com" target="_blank" className="hover:text-red-500 transition-colors">
              wolfmededu@gmail.com
            </a>

            <div className="flex justify-center sm:justify-start space-x-4 mt-4">
              <Link
                href="https://www.facebook.com"
                target="_blank"
                className="hover:text-red-500 transition-colors border border-zinc-400 p-1 rounded-2xl hover:bg-zinc-200"
              >
                <FacebookIcon />
              </Link>
              <Link
                href="https://www.linkedin.com/in/wolfmed-edukacja/"
                target="_blank"
                className="hover:text-zinc-800 transition-colors border border-zinc-400 p-1 rounded-2xl hover:bg-zinc-200"
              >
                <LinkedInIcon />
              </Link>
              <Link
                href="https://x.com/wolfmededukacja"
                target="_blank"
                className="hover:text-red-500 transition-colors border border-zinc-400 p-1 rounded-2xl hover:bg-zinc-200"
              >
                <XIcon />
              </Link>
            </div>
          </div>
        </div>

        {/* Copyright and attribution */}
        <div className="border-t border-zinc-200 pt-8 mt-8 text-sm text-center">
          <p>© 2024 Wolfmed-Edukacja. Wszelkie prawa zastrzeżone.</p>
          <Link href="https://wesa.vercel.app/" target="_blank" className="hover:text-red-500 transition-colors ">
            Designed by <span className="font-bold">WESA</span>
          </Link>
        </div>
      </div>
    </footer>
  )
}
