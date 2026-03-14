import type { Resource } from '@/types/resourceTypes';

interface ResourceAutocompleteProps {
  resources: Resource[];
  selectedIndex: number;
  onSelect: (displayName: string) => void;
  loading?: boolean;
  direction?: 'up' | 'down';
}

export function ResourceAutocomplete({
  resources,
  selectedIndex,
  onSelect,
  loading = false,
  direction = 'down',
}: ResourceAutocompleteProps) {
  const positionClass = direction === 'up' ? 'bottom-full mb-2' : 'mt-2'
  const compact = direction === 'up'
  const sizeClass = compact ? 'w-full' : 'max-w-xl'

  if (loading) {
    return (
      <div className={`absolute z-50 ${sizeClass} ${positionClass} bg-white border border-zinc-200 rounded-lg shadow-lg`}>
        <div className={`${compact ? 'px-3 py-2 text-xs' : 'px-4 py-3 text-sm'} text-zinc-500`}>
          Ładowanie zasobów...
        </div>
      </div>
    );
  }

  if (resources.length === 0) {
    return (
      <div className={`absolute z-50 ${sizeClass} ${positionClass} bg-white border border-zinc-200 rounded-lg shadow-lg`}>
        <div className={`${compact ? 'px-3 py-2 text-xs' : 'px-4 py-3 text-sm'} text-zinc-500`}>
          Nie znaleziono plików
        </div>
      </div>
    );
  }

  return (
    <div className={`absolute z-50 ${sizeClass} ${positionClass} bg-white border border-zinc-200 rounded-lg shadow-lg overflow-y-auto ${compact ? 'max-h-48' : 'max-h-72'}`}>
      {resources.map((resource, index) => (
        <button
          key={resource.name}
          type="button"
          onClick={() => onSelect(resource.displayName)}
          className={`
            w-full ${compact ? 'px-3 py-2' : 'px-4 py-3'} flex items-center justify-between
            transition-colors border-b last:border-b-0
            text-left
            ${
              index === selectedIndex
                ? 'bg-zinc-100 border-l-4 border-l-zinc-800'
                : 'hover:bg-zinc-50'
            }
          `}
        >
          <span className={`font-medium text-zinc-900 truncate ${compact ? 'text-[11px] max-w-[calc(100%-3.5rem)]' : 'text-sm'}`}>{resource.displayName}</span>
          <span className={`shrink-0 text-zinc-500 ${compact ? 'text-[11px] ml-2' : 'text-sm'}`}>
            {resource.type === 'doc'
              ? 'Dok.'
              : resource.type === 'note'
                ? 'Notatka'
                : 'Materiał'}
          </span>
        </button>
      ))}
    </div>
  );
}
