import Link from 'next/link'

export default function CanceledPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Płatność anulowana</h1>
        <p className="text-xl mb-8">Twoja płatność została anulowana. Nie zostały naliczane żadne opłaty.</p>
        <Link href="/konto-premium">Spróbuj ponownie</Link>
      </div>
    </div>
  )
}
