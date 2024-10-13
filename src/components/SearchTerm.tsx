'use client'

import Label from './Label'
import Input from './Input'

export default function SearchTerm({
  label,
  searchTerm,
  setSearchTerm,
}: {
  label: string
  searchTerm: string
  setSearchTerm: (term: string) => void
}) {
  return (
    <div className="flex w-full flex-col">
      <Label className="pb-1 text-sm text-muted-foreground" label={label} htmlFor="input" />

      <Input
        value={searchTerm}
        onChangeHandler={(e) => setSearchTerm(e.target.value)}
        id="input"
        type="text"
        className="flex h-10 w-full rounded-md border border-red-100/80 bg-[#ffc5c5] px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-zinc-400 shadow-sm shadow-zinc-400 focus:border-zinc-700/60 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
        placeholder="Wyszukaj..."
      />
    </div>
  )
}
