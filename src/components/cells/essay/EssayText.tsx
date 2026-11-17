'use client'

import { useMemo } from 'react'
import Editor from '@/components/editor/Editor'
import { useCellsStore } from '@/store/useCellsStore'
import { getLexicalContent } from '@/helpers/getLexicalContent'
import EssayDownload from './EssayDownload'
import EssaySources from './EssaySources'
import type { EssayDocumentProps } from '@/types/essayUiTypes'

export default function EssayText({ draft, onChange }: EssayDocumentProps) {
  const version = useCellsStore((state) => state.serverVersion)
  const words = useMemo(() => {
    const text = getLexicalContent(draft.editorContent).trim()
    return text ? text.split(/\s+/).length : 0
  }, [draft.editorContent])
  if (!draft.editorContent) return <p className="text-sm text-zinc-500">Przygotuj i zatwierdź plan, aby napisać pracę.</p>
  return (
    <div className="space-y-4">
      <p className="text-xs text-zinc-500">Edytuj tekst przed pobraniem. Zmiany zapiszesz przyciskiem zapisu planszy.</p>
      <div className="h-[520px] min-h-64">
        <Editor key={`${draft.documentId}:${version}`} initialContent={draft.editorContent} onChange={(editor) => onChange(JSON.stringify(editor.toJSON()))} />
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3"><span className="text-xs text-zinc-500">{words} słów</span><EssayDownload draft={draft} /></div>
      <EssaySources sources={draft.sources} />
    </div>
  )
}
