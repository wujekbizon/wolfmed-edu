'use client'

import Label from '@/components/ui/Label'
import Input from '@/components/ui/Input'

export default function SearchTerm({
  label,
  searchTerm,
  setSearchTerm,
  isExpanded,
  toggleExpand,
  title,
  className,
}: {
  label: string
  searchTerm: string
  setSearchTerm: (term: string) => void
  isExpanded: boolean
  toggleExpand: () => void
  title?: string
  className?: string
}) {
  return (
    <div
      className={`${className} relative w-full rounded-full border border-red-200/60 bg-[#ffb1b1] shadow-md shadow-zinc-500`}
    >
      <button
        type="button"
        onClick={toggleExpand}
        className={`flex items-center justify-center cursor-pointer w-10 h-10 rounded-full bg-[#ffc5c5] text-red-500 text-2xl hover:bg-[#f58a8a] border border-red-200/60 hover:border-zinc-900 hover:shadow-sm shadow-md shadow-zinc-500 hover:scale-95 transition-all duration-300 ${
          isExpanded ? 'rotate-90' : ''
        }`}
      >
        {isExpanded ? '✕' : '🔍'}
      </button>

      {!isExpanded && title && (
        <h3 className="absolute left-[calc(50%-100px)] right-[calc(50%-120px)] top-[calc(50%-12px)] bottom-[calc(50%-12px)] text-base sm:text-xl font-semibold text-zinc-800 text-center">
          {title}
        </h3>
      )}
      <div
        className={`absolute right-0 top-0 overflow-hidden transition-all duration-300 ${
          isExpanded ? 'w-full opacity-100' : 'w-0 opacity-0'
        }`}
      >
        <Label className="sr-only" label={label} htmlFor="search-input" />
        <Input
          id="search-input"
          value={searchTerm}
          onChangeHandler={(e) => setSearchTerm(e.target.value)}
          type="text"
          className="w-full h-10 pl-4 pr-12 rounded-full border border-red-200/60 focus:outline-none focus:border-zinc-400 bg-zinc-50"
          placeholder="Wyszukaj..."
          autoComplete="search"
        />
        <button
          type="button"
          onClick={() => {
            setSearchTerm('')
            toggleExpand()
          }}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-red-400 font-bold cursor-pointer text-lg hover:text-red-600"
        >
          ✕
        </button>
      </div>
    </div>
  )
}
