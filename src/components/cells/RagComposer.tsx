'use client'

import type { KeyboardEvent } from 'react'
import { ArrowUp, LoaderCircle } from 'lucide-react'
import Button from '@/components/ui/Button'
import { Textarea } from '@/components/ui/Textarea'
import FieldError from '@/components/FieldError'
import type { RagComposerProps } from '@/types/ragCellUiTypes'
import { AIAutocompleteDropdowns } from './AIAutocompleteDropdowns'
import CommandBar from './CommandBar'

export default function RagComposer({ cellId, topic, state, isPending, input, selection, onSubmit, noScriptFallback }: RagComposerProps) {
  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.nativeEvent.isComposing || event.nativeEvent.keyCode === 229) return
    if (event.key === 'Enter' && event.shiftKey) return
    input.handleKeyDown(event)
    if (event.defaultPrevented || input.showCommandAutocomplete || input.showResourceAutocomplete) return
    if (event.key !== 'Enter' || event.altKey || event.ctrlKey || event.metaKey) return
    event.preventDefault()
    if (!isPending && !event.repeat) event.currentTarget.form?.requestSubmit()
  }

  return (
    <form action={onSubmit} className='shrink-0 border-t border-rose-100/80 bg-white/95 p-2 sm:p-3'>
      <input type='hidden' name='cellId' value={cellId} />
      <input type='hidden' name='commandsEnabled' value={String(input.slashCommandsEnabled)} />
      <div className='relative'>
        <Textarea
          ref={input.textareaRef}
          name='question'
          aria-label='Wiadomość do Wolfka'
          defaultValue={topic}
          placeholder={!input.slashCommandsEnabled && selection.command
            ? `Podaj temat, np. „${selection.command.example}”`
            : input.slashCommandsEnabled ? 'Zapytaj Wolfka… (@ pliki, / polecenia)' : 'Zapytaj Wolfka… (@ pliki)'}
          rows={2}
          onChange={input.handleChange}
          onKeyDown={handleKeyDown}
        />
        <AIAutocompleteDropdowns input={input} direction='up' />
        <FieldError formState={state} name='question' />
      </div>
      <div className='mt-2 flex items-end gap-2'>
        <div className='min-w-0 flex-1'>
          {!input.slashCommandsEnabled && <>
            <CommandBar selection={selection} disabled={isPending} />
            <FieldError formState={state} name='commandCount' />
          </>}
          <p className='mt-1 hidden text-[11px] text-zinc-400 sm:block'>Enter — wyślij · Shift+Enter — nowa linia</p>
        </div>
        <Button type='submit' size='sm' shape='pill' disabled={isPending}
          aria-label={isPending ? 'Wolfek przygotowuje odpowiedź' : 'Wyślij wiadomość do Wolfka'}
          className='min-h-11 min-w-11 shrink-0'>
          {isPending ? <LoaderCircle size={18} className='animate-spin motion-reduce:animate-none' /> : <ArrowUp size={18} />}
          <span className='hidden sm:inline'>{isPending ? 'Wysyłam…' : 'Wyślij'}</span>
        </Button>
      </div>
      {noScriptFallback}
    </form>
  )
}
