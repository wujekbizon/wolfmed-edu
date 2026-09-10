export default function StripeReportSkeleton() {
  return (
    <div className="animate-pulse space-y-6" role="status" aria-label="Wczytywanie raportu Stripe">
      <div className="h-9 w-64 rounded bg-zinc-200" />
      <div className="h-12 w-80 max-w-full rounded bg-zinc-200" />
      <div className="h-72 rounded-xl bg-zinc-200" />
    </div>
  )
}
