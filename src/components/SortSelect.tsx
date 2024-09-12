import { SortOption, useSortCompletedTestsStore } from '@/store/useSortCompletedTestsStore'

export default function SortSelect() {
  const { sortOption, setSortOption } = useSortCompletedTestsStore()

  return (
    <div className="flex justify-end w-full">
      <select
        value={sortOption}
        onChange={(e) => setSortOption(e.target.value as SortOption)}
        className="p-2 rounded-full text-xs sm:text-sm border-red-200/40 bg-white shadow shadow-zinc-500 cursor-pointer outline-none"
      >
        <option value="dateDesc">Od Najnowszych</option>
        <option value="dateAsc">Od Najstarszych</option>
        <option value="scoreDesc">Najwyższy wynik</option>
        <option value="scoreAsc">Najniższy wynik</option>
      </select>
    </div>
  )
}
