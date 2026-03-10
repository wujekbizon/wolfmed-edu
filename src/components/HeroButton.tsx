import Link from 'next/link'

type HeroButtonProps = {
  link: string
  children: React.ReactNode
  className?: string
}

export default function HeroButton({ link, children, className = '' }: HeroButtonProps) {
  return (
    <Link
      href={link}
      className={`inline-block text-center relative bg-linear-to-r from-red-400 to-red-500 text-white text-base sm:text-lg font-semibold px-8 sm:px-10 py-3 rounded-full shadow-lg shadow-red-400/30 border border-zinc-900/70 transition-all duration-300 ease-out hover:shadow-xl hover:shadow-red-400/40 hover:scale-105 hover:border-zinc-900/90 active:scale-95 before:absolute before:inset-0 before:bg-linear-to-r before:from-white/10 before:to-transparent before:rounded-full before:opacity-0 hover:before:opacity-100 before:transition-opacity overflow-hidden ${className}`}
    >
      {children}
    </Link>
  )
}
