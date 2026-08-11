export default function PaymentResultSkeleton() {
  return (
    <div className="flex min-h-[calc(100vh-70px)] items-center justify-center p-6 sm:p-12">
      <div className="w-full max-w-md animate-pulse rounded-3xl border border-zinc-200 bg-zinc-50 p-8 shadow-lg">
        <div className="mx-auto h-20 w-20 rounded-full bg-zinc-200" />
        <div className="mx-auto mt-6 h-9 w-64 rounded bg-zinc-200" />
        <div className="mx-auto mt-6 h-14 w-full rounded bg-zinc-200" />
        <div className="mt-6 h-12 w-full rounded-lg bg-zinc-300" />
      </div>
    </div>
  )
}
