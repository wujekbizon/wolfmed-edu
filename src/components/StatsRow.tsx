import { BookOpen, Target, Star, GraduationCap } from 'lucide-react'

interface StatsRowProps {
  totalQuestions: number
  testsAttempted: number
  totalScore: number
  enrolledCount: number
}

export default function StatsRow({
  totalQuestions,
  testsAttempted,
  totalScore,
  enrolledCount,
}: StatsRowProps) {
  const cards = [
    {
      icon: <BookOpen className="w-5 h-5" />,
      value: totalQuestions,
      label: 'Pytań rozwiązanych',
      accent: false,
    },
    {
      icon: <Target className="w-5 h-5" />,
      value: testsAttempted,
      label: 'Prób testów',
      accent: false,
    },
    {
      icon: <Star className="w-5 h-5" />,
      value: totalScore,
      label: 'Łączny wynik',
      accent: true,
    },
    {
      icon: <GraduationCap className="w-5 h-5" />,
      value: enrolledCount,
      label: enrolledCount === 1 ? 'Twój kurs' : 'Twoich kursów',
      accent: false,
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
      {cards.map((card, i) => (
        <div
          key={i}
          className={`rounded-2xl p-4 flex flex-col gap-1.5 ${
            card.accent
              ? 'bg-rose-50/40 backdrop-blur-md border border-rose-200/40'
              : 'bg-white/60 backdrop-blur-md border border-white/50'
          }`}
        >
          <span className={card.accent ? 'text-rose-500' : 'text-zinc-500'}>
            {card.icon}
          </span>
          <span
            className={`text-2xl font-bold tabular-nums ${
              card.accent ? 'text-rose-600' : 'text-zinc-900'
            }`}
          >
            {card.value}
          </span>
          <span className={`text-xs ${card.accent ? 'text-rose-400' : 'text-zinc-500'}`}>
            {card.label}
          </span>
        </div>
      ))}
    </div>
  )
}
