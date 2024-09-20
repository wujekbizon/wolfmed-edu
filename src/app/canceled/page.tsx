import Link from 'next/link'

export default function CanceledPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Payment Canceled</h1>
        <p className="text-xl mb-8">Your payment was canceled. No charges were made.</p>
        <Link href="/konto-premium">Try Again</Link>
      </div>
    </div>
  )
}
