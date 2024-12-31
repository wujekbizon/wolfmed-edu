import { SortOption } from '@/store/useForumSearch'
import { sortOptions } from '@/constants/forumSort'

type Props = {
  sortOption: SortOption
  onSort: (option: SortOption) => void
}

export default function ForumSort({ sortOption, onSort }: Props) {
  return (
    <div className="relative">
      <select
        value={sortOption}
        onChange={(e) => onSort(e.target.value as SortOption)}
        className="appearance-none w-full md:w-48 pl-4 pr-8 py-2 bg-zinc-700/50 rounded-lg text-zinc-100 text-sm outline-none focus:ring-1 focus:ring-zinc-300/20 cursor-pointer"
      >
        {sortOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 text-xs pointer-events-none">▼</span>
    </div>
  )
}
