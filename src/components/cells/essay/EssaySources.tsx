import SourceChip from '@/components/cells/SourceChip'
import type { EssaySourcesProps } from '@/types/essayUiTypes'

export default function EssaySources({ sources }: EssaySourcesProps) {
  if (!sources.length) return null
  return (
    <details className="border-t border-zinc-200 pt-4">
      <summary className="cursor-pointer text-sm font-medium text-zinc-700">Źródła ({sources.length})</summary>
      <div className="mt-3 flex flex-wrap gap-2">{sources.map((source, index) => <SourceChip key={index} source={source} />)}</div>
    </details>
  )
}
