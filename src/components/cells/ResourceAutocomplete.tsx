interface Resource {
  name: string;
  displayName: string;
}

interface ResourceAutocompleteProps {
  resources: Resource[];
  selectedIndex: number;
  onSelect: (filename: string) => void;
  loading?: boolean;
}

export function ResourceAutocomplete({
  resources,
  selectedIndex,
  onSelect,
  loading = false,
}: ResourceAutocompleteProps) {
  if (loading) {
    return (
      <div className="absolute z-50 max-w-xl mt-2 bg-white border border-zinc-200 rounded-lg shadow-lg">
        <div className="px-4 py-3 text-sm text-zinc-500">
          Ładowanie zasobów...
        </div>
      </div>
    );
  }

  if (resources.length === 0) {
    return (
      <div className="absolute z-50 max-w-xl mt-2 bg-white border border-zinc-200 rounded-lg shadow-lg">
        <div className="px-4 py-3 text-sm text-zinc-500">
          Nie znaleziono plików
        </div>
      </div>
    );
  }

  return (
    <div className="absolute z-50 max-w-xl mt-2 bg-white border border-zinc-200 rounded-lg shadow-lg max-h-72 overflow-y-auto">
      {resources.map((resource, index) => (
        <button
          key={resource.name}
          type="button"
          onClick={() => onSelect(resource.name)}
          className={`
            w-full px-4 py-3 flex items-center justify-between
            transition-colors border-b last:border-b-0
            text-left
            ${
              index === selectedIndex
                ? 'bg-zinc-100 border-l-4 border-l-zinc-800'
                : 'hover:bg-zinc-50'
            }
          `}
        >
          <span className="font-medium text-zinc-900">{resource.name}</span>
          <span className="text-sm text-zinc-500">Zasób</span>
        </button>
      ))}
    </div>
  );
}
