export default function DiagramConvertingState() {
  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center rounded bg-zinc-100/90 dark:bg-zinc-800/90">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-zinc-600 mx-auto mb-2" />
        <p className="text-sm text-zinc-600 dark:text-zinc-400">Konwertowanie diagramu...</p>
      </div>
    </div>
  )
}
