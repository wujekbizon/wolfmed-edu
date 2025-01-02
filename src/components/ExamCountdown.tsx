import { calculateTimeLeft } from '@/utils/dateUtils'
import ExamCountdownDisplay from './ExamCountdownDisplay'

export default function ExamCountdown() {
  const { timeLeft, currentPeriod } = calculateTimeLeft()

  if (!currentPeriod) {
    return (
      <div className="w-full p-4 sm:p-6 bg-zinc-900 backdrop-blur-md rounded-xl shadow-lg border border-zinc-800 hover:shadow-xl hover:border-zinc-700 transition-all duration-300">
        <h3 className="text-lg sm:text-xl font-bold text-white text-center">
          Brak zaplanowanych sesji egzaminacyjnych
        </h3>
      </div>
    )
  }

  return (
    <div className="w-full p-4 sm:p-6 bg-zinc-900 backdrop-blur-md rounded-xl shadow-lg border border-zinc-800 hover:shadow-xl hover:border-zinc-700 transition-all duration-300">
      <ExamCountdownDisplay initialPeriod={currentPeriod} initialTimeLeft={timeLeft} />
    </div>
  )
}
