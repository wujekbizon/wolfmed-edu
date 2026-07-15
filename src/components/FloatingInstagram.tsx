'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { X } from 'lucide-react'
import InstagramIcon from '@/components/icons/InstagramIcon'
import { useInstagramBannerStore } from '@/store/useInstagramBannerStore'
import {
  INSTAGRAM_URL,
  FOOTER_INSTAGRAM_ID,
  instagramHighlights
} from '@/constants/instagram'

export default function FloatingInstagram() {
  const [atFooter, setAtFooter] = useState(false)
  const isDismissed = useInstagramBannerStore((state) => state.isDismissed)
  const dismiss = useInstagramBannerStore((state) => state.dismiss)

  useEffect(() => {
    const target = document.getElementById(FOOTER_INSTAGRAM_ID)
    if (!target) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry) setAtFooter(entry.isIntersecting)
      },
      { rootMargin: '0px 0px -10% 0px' }
    )
    observer.observe(target)
    return () => observer.disconnect()
  }, [])

  if (isDismissed) return null

  return (
    <div
      aria-hidden={atFooter}
      className={`fixed inset-x-0 bottom-0 z-40 transition-transform duration-500 ease-out ${
        atFooter ? 'translate-y-full' : 'translate-y-0'
      }`}
    >
      <div className='mx-auto max-w-6xl px-3 pb-3 sm:px-6 sm:pb-4'>
        <div className='relative overflow-hidden rounded-2xl border border-zinc-200 bg-white/95 shadow-lg shadow-zinc-900/10 backdrop-blur'>
          <div className='absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-fuchsia-500 via-red-500 to-amber-400' />

          <div className='flex items-center gap-3 p-3 sm:gap-4 sm:p-4'>
            <span className='flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-fuchsia-500 via-red-500 to-amber-400 text-white sm:h-10 sm:w-10'>
              <InstagramIcon />
            </span>

            <div className='min-w-0 flex-1 sm:flex-none'>
              <p className='truncate text-sm font-semibold text-zinc-800'>
                Wolfmed Edukacja na Instagramie
              </p>
              <p className='hidden text-xs text-zinc-500 sm:block'>
                Codzienne quizy, procedury i ciekawostki medyczne
              </p>
            </div>

            <ul className='hidden flex-1 items-center justify-center gap-x-5 gap-y-1 lg:flex lg:flex-wrap'>
              {instagramHighlights.map(({ Icon, label }) => (
                <li
                  key={label}
                  className='flex items-center gap-1.5 text-xs text-zinc-600'
                >
                  <Icon
                    className='h-3.5 w-3.5 flex-shrink-0 text-red-500'
                    aria-hidden='true'
                  />
                  <span>{label}</span>
                </li>
              ))}
            </ul>

            <Link
              href={INSTAGRAM_URL}
              target='_blank'
              className='inline-flex flex-shrink-0 items-center gap-2 rounded-2xl bg-zinc-900 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-500 sm:ml-auto sm:px-4 lg:ml-0'
            >
              <InstagramIcon />
              <span className='hidden xs:inline'>Obserwuj</span>
            </Link>

            <button
              type='button'
              onClick={dismiss}
              aria-label='Zamknij baner Instagrama'
              className='flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700'
            >
              <X className='h-4 w-4' aria-hidden='true' />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
