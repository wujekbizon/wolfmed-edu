import FacebookIcon from '@/components/icons/FacebookIcon'
import LinkedInIcon from '@/components/icons/LinkedInIcon'
import XIcon from '@/components/icons/XIcon'
import { navLinks } from '@/constants/navLinks'
import Image from 'next/image'
import Link from 'next/link'
import CookieSettingsButton from './cookies/CookieSettingsButton'
import FooterInstagram from '@/components/FooterInstagram'

const socialLinks = [
  { href: 'https://www.facebook.com', label: 'Facebook', Icon: FacebookIcon },
  { href: 'https://www.linkedin.com/in/wolfmed-edukacja/', label: 'LinkedIn', Icon: LinkedInIcon },
  { href: 'https://x.com/wolfmededukacja', label: 'X', Icon: XIcon },
]

const legalLinks = [
  { href: '/warunki', label: 'Warunki Użytkowania' },
  { href: '/polityka-prywatnosci', label: 'Polityka Prywatności' },
]

export default function Footer() {
  return (
    <footer className="w-full bg-zinc-100 text-zinc-800">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <FooterInstagram />

        <div className="mt-12 grid gap-10 lg:grid-cols-12">
          {/* Brand */}
          <div className="lg:col-span-4">
            <div className="flex items-center gap-3">
              <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full border border-zinc-400 bg-zinc-200">
                <Image
                  src="https://utfs.io/a/zw3dk8dyy9/UVAwLrIxs2k5UOm8ArIxs2k5EyuGdN4SRigYP6qreJDvtVZl"
                  alt="Wolfmed Edukacja logo"
                  width={50}
                  height={50}
                  className="h-full w-full rounded-full object-cover"
                  priority
                />
              </div>
              <div>
                <h3 className="text-2xl font-bold leading-tight">
                  WOLFMED <span className="font-normal text-zinc-500">EDUKACJA</span>
                </h3>
                <p className="text-sm text-zinc-500">Innowacyjne rozwiązania w edukacji medycznej</p>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              {socialLinks.map(({ href, label, Icon }) => (
                <Link
                  key={label}
                  href={href}
                  target="_blank"
                  aria-label={label}
                  className="rounded-2xl border border-zinc-400 p-2 text-zinc-800 transition-colors hover:bg-zinc-200 hover:text-red-500"
                >
                  <Icon />
                </Link>
              ))}
            </div>
          </div>

          {/* Link groups */}
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:col-span-8">
            <div>
              <h4 className="mb-4 font-semibold">Nawigacja</h4>
              <ul className="space-y-2 text-sm text-zinc-600">
                {navLinks.map((link) => (
                  <li key={link.id}>
                    <Link href={link.linkUrl} className="transition-colors hover:text-red-500">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="mb-4 font-semibold">Informacje prawne</h4>
              <ul className="space-y-2 text-sm text-zinc-600">
                {legalLinks.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="transition-colors hover:text-red-500">
                      {link.label}
                    </Link>
                  </li>
                ))}
                <li>
                  <CookieSettingsButton />
                </li>
              </ul>
            </div>

            <div>
              <h4 className="mb-4 font-semibold">Kontakt</h4>
              <a
                href="mailto:wolfmededu@gmail.com"
                target="_blank"
                className="text-sm text-zinc-600 transition-colors hover:text-red-500"
              >
                wolfmededu@gmail.com
              </a>
            </div>
          </div>
        </div>

        {/* Copyright and attribution */}
        <div className="mt-12 flex flex-col items-center gap-2 border-t border-zinc-200 pt-8 text-sm text-zinc-500 sm:flex-row sm:justify-between">
          <p>© 2026 Wolfmed-Edukacja. Wszelkie prawa zastrzeżone.</p>
          <Link href="https://wesa.vercel.app/" target="_blank" className="transition-colors hover:text-red-500">
            Designed by <span className="font-bold text-zinc-700">WESA</span>
          </Link>
        </div>
      </div>
    </footer>
  )
}
