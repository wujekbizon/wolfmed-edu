const MESSAGES = {
  loading: { title: 'Wczytywanie fiszek...', hint: '' },
  empty: { title: 'Brak dostępnych fiszek', hint: 'Dodaj pierwszą fiszkę!' },
  error: {
    title: 'Nie udało się wczytać fiszek',
    hint: 'Odśwież stronę, aby spróbować ponownie.',
  },
} as const

export default function FlashcardCellEmpty({
  variant,
}: {
  variant: keyof typeof MESSAGES
}) {
  const { title, hint } = MESSAGES[variant]

  return (
    <div className='flex flex-col items-center justify-center flex-1 text-center'>
      <h3 className='text-xl text-zinc-500 mb-2 font-medium'>{title}</h3>
      {hint && <p className='text-zinc-400'>{hint}</p>}
    </div>
  )
}
