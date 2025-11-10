'use client'

import { useState } from 'react'

export function JsonDocumentation() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="mt-8 w-full border border-border/40 rounded-lg">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors rounded-lg"
      >
        <span className="text-lg font-semibold flex items-center gap-2">
          <span>📖</span>
          <span>Jak przygotować plik JSON?</span>
        </span>
        <svg
          className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="p-4 pt-0 space-y-4">
          <p className="text-sm text-muted-foreground">
            Plik JSON musi zawierać tablicę obiektów z następującą strukturą:
          </p>

          <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-xs font-mono">
{`[
  {
    "category": "anatomia",
    "data": {
      "question": "Która kość należy do czaszki?",
      "answers": [
        { "option": "Kość ciemieniowa", "isCorrect": true },
        { "option": "Obojczyk", "isCorrect": false },
        { "option": "Kość ramienna", "isCorrect": false }
      ]
    }
  },
  {
    "category": "fizjologia",
    "data": {
      "question": "Jaką funkcję pełnią płuca?",
      "answers": [
        { "option": "Wymiana gazowa", "isCorrect": true },
        { "option": "Trawienie", "isCorrect": false }
      ]
    }
  }
]`}
          </pre>

          <div className="space-y-2">
            <h4 className="font-semibold text-sm">Wymagania:</h4>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc pl-5">
              <li><strong>Pytanie:</strong> maksymalnie 650 znaków</li>
              <li><strong>Odpowiedź:</strong> maksymalnie 500 znaków</li>
              <li><strong>Liczba odpowiedzi:</strong> od 2 do 5</li>
              <li><strong>Poprawna odpowiedź:</strong> dokładnie jedna (isCorrect: true)</li>
              <li><strong>Kategoria:</strong> małymi literami (np. "anatomia", "fizjologia")</li>
              <li><strong>Maksymalna liczba pytań:</strong> 1000 na plik</li>
              <li><strong>Maksymalny rozmiar pliku:</strong> 5MB</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold text-sm">Częste błędy:</h4>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc pl-5">
              <li>Brak przecinka między obiektami w tablicy</li>
              <li>Wielka litera w nazwie kategorii</li>
              <li>Więcej niż jedna poprawna odpowiedź</li>
              <li>Brak odpowiedzi oznaczonej jako poprawna</li>
              <li>Używanie pojedynczych cudzysłowów (') zamiast podwójnych (")</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}
