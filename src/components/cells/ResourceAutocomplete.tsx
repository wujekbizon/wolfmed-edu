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
      <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg">
        <div className="px-4 py-3 text-sm text-gray-500">
          Loading resources...
        </div>
      </div>
    );
  }

  if (resources.length === 0) {
    return (
      <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg">
        <div className="px-4 py-3 text-sm text-gray-500">
          No files found
        </div>
      </div>
    );
  }

  return (
    <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-72 overflow-y-auto">
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
                ? 'bg-blue-50 border-l-4 border-l-blue-500'
                : 'hover:bg-gray-50'
            }
          `}
        >
          <span className="font-medium text-gray-900">{resource.name}</span>
          <span className="text-sm text-gray-500">Resource</span>
        </button>
      ))}
    </div>
  );
}
