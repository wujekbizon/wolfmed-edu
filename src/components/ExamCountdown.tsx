import { calculateTimeLeft } from '@/utils/dateUtils'
import CountdownTimer from './CountdownTimer'

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

  const formatDate = (date: Date) => {
    return `${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()}`
  }

  return (
    <div className="w-full p-4 sm:p-6 bg-zinc-900 backdrop-blur-md rounded-xl shadow-lg border border-zinc-800 hover:shadow-xl hover:border-zinc-700 transition-all duration-300">
      <h3 className="text-lg sm:text-xl font-bold text-white text-center mb-2 sm:mb-4">{currentPeriod.label}</h3>
      {currentPeriod.type !== 'in_progress' && (
        <CountdownTimer
          initialDays={timeLeft.days}
          initialHours={timeLeft.hours}
          initialMinutes={timeLeft.minutes}
          initialSeconds={timeLeft.seconds}
        />
      )}
      <p className="text-zinc-400 text-xs sm:text-sm text-center mt-3 sm:mt-4">
        {currentPeriod.type === 'in_progress' ? (
          <>
            Egzaminy trwają od{' '}
            <span className="text-[#ff9898] ml-1 font-medium">{formatDate(currentPeriod.startDate)}</span> do{' '}
            <span className="text-[#ff9898] ml-1 font-medium">{formatDate(currentPeriod.endDate)}</span>
          </>
        ) : currentPeriod.type === 'waiting_results' ? (
          <>
            Wyniki będą dostępne{' '}
            <span className="text-[#ff9898] ml-1 font-medium">{formatDate(currentPeriod.endDate)}</span>
          </>
        ) : (
          <>
            Egzaminy odbędą się od{' '}
            <span className="text-[#ff9898] ml-1 font-medium">{formatDate(currentPeriod.startDate)}</span> do{' '}
            <span className="text-[#ff9898] ml-1 font-medium">{formatDate(currentPeriod.endDate)}</span>
          </>
        )}
      </p>
    </div>
  )
}
