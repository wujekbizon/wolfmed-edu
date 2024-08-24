import { useSearchTermStore } from '@/store/useSearchTermStore'
import Label from './Label'

export default function SearchTerm() {
  const { searchTerm, setSearchTerm } = useSearchTermStore()
  return (
    <div className="flex w-full flex-col">
      <Label className="pb-1 text-sm text-muted-foreground" label="Szukaj terminu" htmlFor="input" />

      <input
        id="input"
        type="text"
        className="flex h-10 w-full rounded-md border border-red-100/80 bg-[#ffc5c5] px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-zinc-400 shadow-sm shadow-zinc-400 focus:border-zinc-700/60 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
        placeholder="Wyszukaj..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
    </div>
  )
}
