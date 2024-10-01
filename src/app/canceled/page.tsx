import Link from 'next/link'

export default function CanceledPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh_-_70px)] bg-background p-6 sm:p-12">
      <div className="flex flex-col items-center gap-4 text-center bg-white p-6 rounded-2xl shadow shadow-zinc-400 border border-red-200/40">
        <h1 className="text-4xl font-bold py-4">Płatność anulowana</h1>
        <p className="text-xl text-zinc-700">Twoja płatność została anulowana. Nie zostały naliczane żadne opłaty.</p>
        <Link
          href="/konto-premium"
          className="p-2 border border-zinc-800 rounded bg-zinc-200 hover:bg-zinc-300 w-full md:w-1/3"
        >
          Spróbuj ponownie
        </Link>
      </div>
    </div>
  )
}
