export default function RagLoadingState() {
  return (
    <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-lg">
      <div className="flex items-center gap-3">
        <div className="flex gap-1">
          <span className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
          <span className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
          <span className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce"></span>
        </div>
        <p className="text-sm text-zinc-600 font-medium">
          Szukam odpowiedzi w dokumentach...
        </p>
      </div>
    </div>
  )
}
