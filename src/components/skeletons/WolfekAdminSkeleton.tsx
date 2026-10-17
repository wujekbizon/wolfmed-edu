export default function WolfekAdminSkeleton() {
  return <div className="space-y-5 motion-safe:animate-pulse" role="status" aria-label="Ładowanie raportów Wolfka">
    <div className="h-9 w-56 rounded-xl bg-zinc-200" /><div className="h-14 rounded-2xl bg-zinc-200" />
    <div className="grid gap-3 sm:grid-cols-4">{[0, 1, 2, 3].map((item) => <div key={item} className="h-28 rounded-2xl bg-zinc-200" />)}</div>
    <div className="h-64 rounded-2xl bg-zinc-200" />
  </div>
}
