export default function LearningPracticeSkeleton() {
  return <div role="status" aria-label="Wczytywanie nauki" className="w-full max-w-3xl space-y-4 motion-safe:animate-pulse">
    <div className="h-10 w-2/3 rounded-lg bg-zinc-200" />
    <div className="h-24 rounded-lg bg-zinc-100" />
    {[0, 1, 2, 3].map((row) => <div key={row} className="h-12 rounded-lg bg-zinc-100" />)}
  </div>
}
