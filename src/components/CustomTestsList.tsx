"use client"

import { useState } from "react"
import { UserCustomTest } from "@/server/db/schema"
import CustomTestCard from "./CustomTestCard"
import { useCustomTestsStore } from "@/store/useCustomTestsStore"

interface CustomTestsListProps {
  tests: UserCustomTest[]
}

export default function CustomTestsList({ tests }: CustomTestsListProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const { openDeleteCategoryModal } = useCustomTestsStore()

  const categories = Array.from(new Set(tests.map(test => test.category)))

  const filteredTests = selectedCategory === "all"
    ? tests
    : tests.filter(test => test.category === selectedCategory)


  const categoryCount = filteredTests.length

  const handleBulkDelete = () => {
    if (selectedCategory !== "all") {
      openDeleteCategoryModal({
        name: selectedCategory,
        count: categoryCount
      })
    }
  }

  if (tests.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="text-6xl mb-4 text-zinc-300">📝</div>
        <h3 className="text-xl font-semibold text-zinc-500 mb-2">
          Brak niestandardowych testów
        </h3>
        <p className="text-zinc-400">
          Utwórz swój pierwszy test, używając formularza w zakładce Tworzenie
        </p>
      </div>
    )
  }

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between bg-white/60 backdrop-blur-sm p-4 rounded-lg border border-zinc-200/60 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center flex-1">
          <label className="text-zinc-700 font-medium whitespace-nowrap">
            Filtruj według kategorii:
          </label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg bg-white/80 backdrop-blur-sm text-sm border border-zinc-200 outline-none focus:ring-2 focus:ring-[#ff9898]/50 transition-all duration-300 text-zinc-700 placeholder:text-zinc-400 placeholder:text-sm"
          >
            <option value="all">Wszystkie kategorie ({tests.length})</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category} ({tests.filter(t => t.category === category).length})
              </option>
            ))}
          </select>
        </div>
        {selectedCategory !== "all" && (
          <button
            onClick={handleBulkDelete}
            className="px-4 py-2.5 bg-linear-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-600 text-white rounded-lg font-medium whitespace-nowrap shadow-sm hover:shadow-md transition-all duration-300"
          >
            Usuń wszystkie z kategorii ({categoryCount})
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredTests.map((test) => (
          <CustomTestCard key={test.id} test={test} />
        ))}
      </div>
    </div>
  )
}
