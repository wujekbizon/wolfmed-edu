import SearchIcon from './icons/SearchIcon'

type Props = {
  searchTerm: string
  onSearch: (term: string) => void
}

export default function ForumSearch({ searchTerm, onSearch }: Props) {
  return (
    <div className="relative w-full md:max-w-md">
      <label htmlFor="forum-search">
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
      </label>
      <input
        id="forum-search"
        type="text"
        value={searchTerm}
        onChange={(e) => onSearch(e.target.value)}
        placeholder="Szukaj na forum..."
        className="w-full pl-10 pr-4 py-2 bg-zinc-700/50 rounded-lg text-zinc-100 text-sm placeholder:text-zinc-500 outline-none focus:ring-1 focus:ring-zinc-300/20"
      />
    </div>
  )
}
