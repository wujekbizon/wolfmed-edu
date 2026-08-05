interface DiagramErrorStateProps {
  onRetry: () => void
}

export default function DiagramErrorState({ onRetry }: DiagramErrorStateProps) {
  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center rounded bg-zinc-100/95 dark:bg-zinc-800/95">
      <div className="max-w-xs text-center">
        <p className="text-sm text-zinc-700 dark:text-zinc-300">
          Nie udało się narysować diagramu.
        </p>
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
          Źródło diagramu zostało zachowane — możesz spróbować ponownie.
        </p>
        <button
          type="button"
          onClick={onRetry}
          className="mt-3 text-xs font-medium text-zinc-700 underline hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-white"
        >
          Spróbuj ponownie
        </button>
      </div>
    </div>
  )
}
