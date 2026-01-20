interface StoreStatusCardProps {
  isConfigured: boolean
  storeName: string | null
  storeDisplayName?: string | undefined
  documentCount: number
}

export default function StoreStatusCard({
  isConfigured,
  storeName,
  storeDisplayName,
  documentCount,
}: StoreStatusCardProps) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-zinc-200">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h2 className="text-xl font-semibold text-zinc-900 mb-2">
            Status File Search Store
          </h2>

          {isConfigured ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-green-700">
                  Skonfigurowany
                </span>
              </div>

              <div className="space-y-2 text-sm text-zinc-600">
                {storeDisplayName && (
                  <div>
                    <span className="font-medium">Nazwa wyświetlana:</span>{' '}
                    {storeDisplayName}
                  </div>
                )}
                <div>
                  <span className="font-medium">Store Name:</span>
                  <code className="ml-2 px-2 py-1 bg-zinc-100 rounded text-xs font-mono">
                    {storeName}
                  </code>
                </div>
                <div>
                  <span className="font-medium">Dokumenty:</span>{' '}
                  {documentCount} plików
                </div>
              </div>

              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
                <p className="text-sm text-blue-800">
                  <span className="font-medium">Uwaga:</span> Upewnij się, że
                  zmienna środowiskowa{' '}
                  <code className="px-1 py-0.5 bg-blue-100 rounded">
                    GOOGLE_FILE_SEARCH_STORE_NAME
                  </code>{' '}
                  jest ustawiona na powyższą wartość.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span className="text-sm font-medium text-yellow-700">
                  Nie skonfigurowany
                </span>
              </div>

              <p className="text-sm text-zinc-600">
                File Search Store nie został jeszcze utworzony. Użyj poniższego
                formularza, aby utworzyć nowy store i przesłać dokumenty
                medyczne.
              </p>

              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                <p className="text-sm text-yellow-800">
                  <span className="font-medium">Wymagane:</span> Po utworzeniu
                  store, dodaj jego nazwę do zmiennej środowiskowej{' '}
                  <code className="px-1 py-0.5 bg-yellow-100 rounded">
                    GOOGLE_FILE_SEARCH_STORE_NAME
                  </code>{' '}
                  w pliku <code className="px-1 py-0.5 bg-yellow-100 rounded">.env</code>
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Icon */}
        <div
          className={`w-16 h-16 rounded-lg flex items-center justify-center ${
            isConfigured
              ? 'bg-green-100'
              : 'bg-yellow-100'
          }`}
        >
          <svg
            className={`w-8 h-8 ${
              isConfigured ? 'text-green-600' : 'text-yellow-600'
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z"
            />
          </svg>
        </div>
      </div>
    </div>
  )
}
