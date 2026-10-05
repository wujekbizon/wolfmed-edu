import type { SourceRef } from '@/types/retrievalTypes'

export default function WolfekSources({ sources }: { sources: SourceRef[] }) {
  if (!sources.length) return null
  return <details className="wolfek-sources">
    <summary>Źródła ({sources.length})</summary>
    <ul>{sources.map((source, index) => <li key={`${source.label}:${index}`}>{source.label}</li>)}</ul>
  </details>
}
