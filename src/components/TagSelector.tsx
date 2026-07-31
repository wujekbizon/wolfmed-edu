import { memo } from "react"
import Input from "@/components/ui/Input"
import Label from "@/components/ui/Label"
import DropdownSelect from "@/components/ui/DropdownSelect"
import { TAG_COUNT_OPTIONS } from "@/constants/tagCountOptions"

export const TagSelector = memo(function TagSelector({
  tagCount,
  onTagCountChange,
}: {
  tagCount: number | string
  onTagCountChange: (value: string) => void
}) {
  return (
    <div className="flex gap-4 flex-col justify-between">
      <div className="w-32">
        <p className="pb-1 text-xs text-zinc-400">Liczba tagów</p>
        <DropdownSelect
          options={TAG_COUNT_OPTIONS}
          value={tagCount ? String(tagCount) : null}
          onSelect={onTagCountChange}
          ariaLabel="Liczba tagów"
          placeholder="Wybierz"
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