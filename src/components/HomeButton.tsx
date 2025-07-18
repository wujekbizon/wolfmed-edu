import Link from 'next/link'

export default function HomeButton({ title }: { title: string }) {
  return (
    <div className="text-center mt-4">
      <Link
        className="inline-block bg-linear-to-r from-[#ffb1b1] to-[#ffa5a5] hover:from-[#ffa5a5] hover:to-[#ff9999] text-zinc-800 font-semibold py-2 px-6 sm:py-3 sm:px-8 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 text-sm sm:text-lg"
        href="/"
      >
        {title}
      </Link>
    </div>
  )
}
