import { memo } from "react"
import Input from "@/components/ui/Input"
import Label from "@/components/ui/Label"

const TAG_OPTIONS = [1, 2, 3]

export const TagSelector = memo(function TagSelector({
  tagCount,
  onTagCountChange,
}: {
  tagCount: number
  onTagCountChange: (e: React.ChangeEvent<HTMLSelectElement>) => void
}) {
  return (
    <>
      <div className="flex flex-col gap-2">
        <Label htmlFor="tagCount" label="Liczba tagów" />
        <select
          id="tagCount"
          value={tagCount}
          onChange={onTagCountChange}
          className="w-24 rounded-lg border border-zinc-200 p-2 text-sm"
        >
          {TAG_OPTIONS.map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-row gap-2 mt-2">
        {[...Array(tagCount)].map((_, i) => (
          <Input
            key={i}
            name={`tag${i + 1}`}
            placeholder={`Tag ${i + 1} - opcjonalnie`}
            className="w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg bg-white/80 backdrop-blur-sm text-sm border border-zinc-200 outline-none focus:ring-2 focus:ring-[#ff9898]/50 transition-all"
          />
        ))}
      </div>
    </>
  )
})