interface Document {
  name: string
  displayName: string
}

interface DocumentListTableProps {
  documents: Document[]
}

export default function DocumentListTable({ documents }: DocumentListTableProps) {
  if (documents.length === 0) {
    return (
      <div className="text-center py-8 text-zinc-500">
        <svg
          className="w-12 h-12 mx-auto mb-3 text-zinc-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        <p className="text-sm">Brak dokumentów w store</p>
        <p className="text-xs text-zinc-400 mt-1">
          Użyj przycisku powyżej aby przesłać dokumenty
        </p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-zinc-200">
            <th className="text-left py-3 px-4 text-sm font-medium text-zinc-700">
              #
            </th>
            <th className="text-left py-3 px-4 text-sm font-medium text-zinc-700">
              Nazwa
            </th>
            <th className="text-left py-3 px-4 text-sm font-medium text-zinc-700">
              Status
            </th>
          </tr>
        </thead>
        <tbody>
          {documents.map((doc, index) => (
            <tr
              key={doc.name}
              className="border-b border-zinc-100 hover:bg-zinc-50 transition-colors"
            >
              <td className="py-3 px-4 text-sm text-zinc-500">
                {index + 1}
              </td>
              <td className="py-3 px-4">
                <div>
                  <p className="text-sm font-medium text-zinc-900">
                    {doc.displayName}
                  </p>
                  <p className="text-xs text-zinc-500 font-mono mt-0.5">
                    {doc.name}
                  </p>
                </div>
              </td>
              <td className="py-3 px-4">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                  <span className="w-1.5 h-1.5 bg-green-600 rounded-full"></span>
                  Przesłany
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
