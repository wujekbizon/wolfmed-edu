import { memo } from "react"
import Input from "@/components/ui/Input"
import Label from "@/components/ui/Label"

const TAG_OPTIONS = [1, 2, 3]

export const TagSelector = memo(function TagSelector({
  tagCount,
  onTagCountChange,
}: {
  tagCount: number | string
  onTagCountChange: (e: React.ChangeEvent<HTMLSelectElement>) => void
}) {
  return (
    <div className="flex gap-4 flex-col justify-between">
      <div className="relative w-32">
        <select
          id="tagCount"
          value={tagCount || ""}
          onChange={onTagCountChange}
           className="pl-[106px] peer w-full appearance-none rounded-lg border border-zinc-200 bg-white/80 backdrop-blur-sm px-3 py-2 text-sm text-zinc-700 outline-none focus:ring-2 focus:ring-[#ff9898]/50 transition-all placeholder:text-transparent"
        >
          <option value="" hidden></option>
          {TAG_OPTIONS.map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
        <Label
          htmlFor="tagCount"
          label="Liczba tagów"
          className="absolute left-3 top-[8px] text-sm text-zinc-400 pointer-events-none transition-all duration-300
          peer-focus:-top-4 peer-focus:text-xs peer-focus:text-[#ff9898]"
        />
      </div>

      <div className="flex sm:flex-col flex-row gap-4 w-full">
        {[...Array(tagCount)].map((_, i) => (
          <div key={i} className="relative w-full">
            <Input
              id={`tag${i + 1}`}
              name={`tag${i + 1}`}
              placeholder={`Tag ${i + 1} - opcjonalnie`}
              className="peer w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg bg-white/80 backdrop-blur-sm text-sm border border-zinc-200 outline-none focus:ring-2 focus:ring-[#ff9898]/50 transition-all duration-300 text-zinc-700 placeholder:text-transparent"
            />
            <Label
              htmlFor={`tag${i + 1}`}
              label={`Tag ${i + 1}`}
              className="absolute left-3 top-2.5 text-sm text-zinc-400 pointer-events-none transition-all duration-300 peer-placeholder-shown:top-2.5 peer-placeholder-shown:text-zinc-400 peer-focus:-top-4 peer-focus:text-xs peer-focus:text-[#ff9898]"
            />
          </div>
        ))}
      </div>
    </div>
  )
})