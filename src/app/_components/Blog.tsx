import Link from 'next/link'

export default function Blog() {
  return (
    <section className="h-[calc(100vh_-_70px)] w-full flex flex-col items-center justify-center p-8">
      <div className="w-full lg:w-2/3 xl:w-1/2 h-fit bg-white rounded-2xl p-6 flex flex-col justify-center gap-8">
        <p className="text-center">
          Witam na blogu medycznym, tutaj znajdziesz ciekawe informacje na temat opiekuna medycznego.
        </p>

        <Link
          className="bg-[#ffb1b1] hover:text-[#fffcfc] border border-red-100/50 shadow-sm shadow-zinc-400 text-sm font-semibold py-[9px] px-4 rounded-full hover:bg-[#ffa5a5] transition-colors text-zinc-900 text-center place-self-center"
          href="/"
        >
          Już wkrótce odpalamy !🚀
        </Link>
      </div>
    </section>
  )
}
