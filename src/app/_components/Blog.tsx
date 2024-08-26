import Link from 'next/link'

export default function Blog() {
  return (
    <section className="h-[calc(100vh_-_90px)] sm:h-[calc(100vh_-_110px)] w-full  flex flex-col items-center justify-center p-5">
      <div className="w-full lg:w-2/3 xl:w-1/2 h-3/4 xs:h-1/3 bg-white rounded-2xl p-14 flex flex-col justify-evenly">
        <p>Witam na blogu medycznym, tutaj znajdziesz ciekawe informacje na temat opiekuna medycznego.</p>
        <p>Blog jest tylko dostepny dla zarejestrowanych użytkowników. Zapraszamy do darmowej rejestracji.</p>
        <Link
          className="bg-[#ffb1b1] hover:text-[#fffcfc] mt-4 border border-red-100/50 shadow-sm shadow-zinc-400 text-sm font-semibold py-[9px] px-4 rounded-full hover:bg-[#ffa5a5] transition-colors text-zinc-900 text-center place-self-center"
          href="/rejestracja"
        >
          Zarejestruj się
        </Link>
      </div>
    </section>
  )
}
