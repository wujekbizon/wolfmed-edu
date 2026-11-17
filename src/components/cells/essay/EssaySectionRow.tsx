import { ArrowDown, ArrowUp, MoreHorizontal, Trash2 } from 'lucide-react'
import { useId } from 'react'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { Textarea } from '@/components/ui/Textarea'
import Label from '@/components/ui/Label'
import type { EssaySectionRowProps } from '@/types/essayUiTypes'

export default function EssaySectionRow({ section, index, count, onChange, onMove, onRemove, disabled }: EssaySectionRowProps) {
  const id = useId()
  return (
    <div className="space-y-2 border-t border-zinc-200 py-3">
      <div className="flex items-center gap-2">
        <Input value={section.title} onChangeHandler={(event) => onChange({ ...section, title: event.target.value })} disabled={disabled} ariaLabel={`Tytuł części ${index + 1}`} className="min-w-0 flex-1 rounded-md bg-transparent px-2 py-1 text-sm font-medium text-zinc-800 hover:bg-zinc-50 focus:outline-rose-300" />
        <details className="relative">
          <summary className="flex size-9 cursor-pointer list-none items-center justify-center rounded-md text-zinc-500 hover:bg-zinc-100" aria-label={`Opcje części ${index + 1}`}><MoreHorizontal className="size-4" /></summary>
          <div className="absolute right-0 z-10 flex gap-1 rounded-lg border border-zinc-200 bg-white p-2 shadow-sm">
            <Button variant="ghost" size="sm" disabled={disabled || index === 0} onClick={() => onMove(-1)} aria-label="Przesuń część w górę"><ArrowUp className="size-4" /></Button>
            <Button variant="ghost" size="sm" disabled={disabled || index === count - 1} onClick={() => onMove(1)} aria-label="Przesuń część w dół"><ArrowDown className="size-4" /></Button>
            <Button variant="ghost" size="sm" disabled={disabled} onClick={onRemove} aria-label="Usuń część"><Trash2 className="size-4" /></Button>
          </div>
        </details>
      </div>
      <details className="px-2">
        <summary className="cursor-pointer text-xs text-zinc-500">{section.description || 'Dodaj opis części'}</summary>
        <div className="mt-2">
          <Label htmlFor={id} label="Zakres części" />
          <Textarea id={id} value={section.description} onChange={(event) => onChange({ ...section, description: event.target.value })} disabled={disabled} />
        </div>
      </details>
    </div>
  )
}
