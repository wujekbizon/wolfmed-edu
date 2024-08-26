import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex h-[calc(100vh_-_130px)] sm:h-[calc(100vh_-_150px)] place-self-center rounded-3xl md:rounded-full my-5 w-[98%] mx-auto flex-col items-center md:items-end justify-end bg-[url('/not-found.jpg')] bg-center bg-size-cover text-zinc-950">
      <Link
        href="/"
        className="flex justify-center bg-[#ffc5c5] items-center text-2xl w-64 h-10 transition-all hover:scale-95 rounded-md border border-red-100/50 hover:border-zinc-900 hover:shadow-sm hover:bg-[#f58a8a] shadow-md shadow-zinc-500"
      >
        Powrót
      </Link>
    </div>
  )
}
