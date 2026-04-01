"use client"

import { UserCustomTest } from "@/server/db/schema"
import { useCustomTestsStore } from "@/store/useCustomTestsStore"
import { formatDate } from "@/helpers/formatDate"

interface CustomTestCardProps {
  test: UserCustomTest
}

export default function CustomTestCard({ test }: CustomTestCardProps) {
  const { openDeleteTestModal } = useCustomTestsStore()

  const testData = test.data as { question: string; answers: Array<{ option: string; isCorrect: boolean }> }

  const handleDelete = () => {
    openDeleteTestModal({
      id: test.id,
      question: testData.question
    })
  }

  const createdDate = test.createdAt
    ? formatDate(test.createdAt.toString())
    : "nieznana data"

  return (
    <div className="relative bg-white border border-zinc-200/50 rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-300">
      <div className="flex justify-between items-start gap-4">
        <div className="flex-1">
          <div className="mb-3">
            <span className="inline-block px-3 py-1 bg-zinc-900/90 text-zinc-100 text-sm rounded-full border border-zinc-800">
              {test.meta.category}
            </span>
          </div>
          <h3 className="text-lg font-semibold text-zinc-900 mb-4">
            {testData.question}
          </h3>
          <div className="space-y-2 mb-4">
            {testData.answers.map((answer, index) => (<div
              key={index}
              className={`flex items-start gap-2 p-3 rounded-lg ${answer.isCorrect
                ? "bg-green-50 border border-green-200"
                : "bg-zinc-50"
                }`}
            >
              <span className={`font-semibold ${answer.isCorrect ? "text-green-700" : "text-zinc-500"}`}>
                {String.fromCharCode(65 + index)}.
              </span>
              <span className={answer.isCorrect ? "text-zinc-800" : "text-zinc-600"}>
                {answer.option}
              </span>
              {answer.isCorrect && (
                <span className="ml-auto text-green-700 text-sm font-semibold">✓ Poprawna</span>
              )}
            </div>
            ))}
          </div>
          <div className="text-sm text-zinc-600">
            Utworzono {createdDate}
          </div>
        </div>
        <button
          onClick={handleDelete}
          className="absolute right-2 top-2 shrink-0 p-2 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
          title="Usuń test"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>
    </div>
  )
}
