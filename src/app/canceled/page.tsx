import Link from 'next/link'

export const dynamic = 'force-static'

export default function CanceledPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh_-_70px)] bg-transparent p-6 sm:p-12">
      <div className="w-full max-w-md bg-zinc-50 p-8 rounded-3xl shadow-lg border border-zinc-200 transition-all duration-300 hover:shadow-xl">
        <div className="flex flex-col items-center gap-6 text-center">
          <div className="bg-white p-4 rounded-full w-20 h-20 flex items-center justify-center shadow-sm">
            <span className="text-red-600 text-4xl font-bold">!</span>
          </div>
          <h1 className="text-3xl font-bold text-zinc-800">Płatność anulowana</h1>
          <p className="text-lg text-zinc-600">Twoja płatność została anulowana. Nie zostały naliczane żadne opłaty.</p>
          <Link
            href="/konto-premium"
            className="flex items-center justify-center gap-2 w-full p-3 bg-zinc-800 text-white rounded-lg font-semibold transition-colors duration-300 hover:bg-zinc-700"
          >
            <span className="mr-2">&larr;</span>
            Wróć do konta premium
          </Link>
        </div>
      </div>
    </div>
  )
}
