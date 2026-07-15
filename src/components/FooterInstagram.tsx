import Image from 'next/image'
import Link from 'next/link'
import instaQR from '@/images/instaQR.png'
import InstagramIcon from '@/components/icons/InstagramIcon'
import {
  INSTAGRAM_URL,
  FOOTER_INSTAGRAM_ID,
  instagramHighlights as highlights
} from '@/constants/instagram'

export default function FooterInstagram() {
  return (
    <div id={FOOTER_INSTAGRAM_ID} className='mb-10 max-w-full md:max-w-6xl mx-auto px-4 sm:px-6 lg:px-8'>
      <div className='relative overflow-hidden rounded-3xl border border-zinc-200 bg-white'>
        <div className='absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-fuchsia-500 via-red-500 to-amber-400' />

        <div className='flex flex-col items-center gap-8 p-6 sm:p-8 md:flex-row md:items-center md:gap-10 lg:gap-12 lg:p-10'>
          <div className='flex flex-shrink-0 items-center justify-center'>
            <div className='rounded-2xl border border-zinc-200 bg-white p-3 shadow-sm'>
              <div className='relative aspect-square w-44 sm:w-48 lg:w-56'>
                <Image
                  src={instaQR}
                  alt='Kod QR prowadzący do profilu Wolfmed Edukacja na Instagramie'
                  fill
                  sizes='(min-width: 1024px) 224px, (min-width: 640px) 192px, 176px'
                  className='rounded-xl object-contain'
                />
              </div>
            </div>
          </div>
          <div
            className='hidden self-stretch w-px bg-zinc-200 md:block'
            aria-hidden='true'
          />
          <div className='flex w-full flex-col items-center text-center md:items-start md:text-left'>
            <span className='inline-block rounded-full bg-red-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-red-500'>
              Nowość na Instagramie
            </span>

            <p className='mt-4 max-w-xl text-zinc-600'>
              Dopiero zaczynamy naszą przygodę na Instagramie — i chcemy budować
              ją razem z Wami! Codziennie znajdziecie tu:
            </p>

            <ul className='mt-4 grid w-full max-w-xl grid-cols-1 gap-x-6 gap-y-2.5 text-left text-sm text-zinc-700 sm:grid-cols-2'>
              {highlights.map(({ Icon, label }) => (
                <li key={label} className='flex items-start gap-2'>
                  <Icon
                    className='mt-0.5 h-4 w-4 flex-shrink-0 text-red-500'
                    aria-hidden='true'
                  />
                  <span>{label}</span>
                </li>
              ))}
            </ul>
            <Link
              href={INSTAGRAM_URL}
              target='_blank'
              className='mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-zinc-400 px-4 py-2.5 text-sm font-semibold text-zinc-800 transition-colors hover:bg-zinc-200 hover:text-red-500 sm:w-auto'
            >
              <InstagramIcon />
              Obserwuj @wolfmededukacja.pl
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
