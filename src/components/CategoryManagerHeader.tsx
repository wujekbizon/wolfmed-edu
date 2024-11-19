export default function CategoryManagerHeader() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-zinc-800">Własne kategorie pytań</h1>
        <p className="text-zinc-600">
          Stwórz własne zestawy pytań dopasowane do Twoich potrzeb. Możesz organizować pytania w kategorie tematyczne,
          co ułatwi Ci naukę i powtórki materiału. Dostęp do tworzonych kategorii z wybranymi pytaniami w zakładce Testy
        </p>
      </div>
      <div className="flex items-center gap-2 text-sm bg-[#ffc5c5]/20 border border-red-100/20 rounded-lg p-3">
        <svg className="h-5 w-5 text-zinc-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <p className="text-zinc-600">
          Twoje kategorie są zapisywane lokalnie w przeglądarce. Nie są przechowywane w bazie danych.
        </p>
      </div>
    </div>
  )
}
