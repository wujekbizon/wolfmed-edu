import { calculateTimeLeft } from '@/utils/dateUtils'
import CountdownTimer from './CountdownTimer'

export default function ExamCountdown() {
  const { days, hours, minutes, seconds } = calculateTimeLeft()

  return (
    <div
      className="w-full p-4 sm:p-6 bg-zinc-900 backdrop-blur-md rounded-xl 
      shadow-lg border border-zinc-800 hover:shadow-xl hover:border-zinc-700 transition-all duration-300"
    >
      <h3 className="text-lg sm:text-xl font-bold text-white text-center mb-2 sm:mb-4">Czas do egzaminu</h3>
      <CountdownTimer initialDays={days} initialHours={hours} initialMinutes={minutes} initialSeconds={seconds} />
      <p className="text-zinc-400 text-xs sm:text-sm text-center mt-3 sm:mt-4">
        Odliczanie do pierwszego terminu egzaminu -
        <span className="text-[#ff9898] ml-1 font-medium">9 stycznia 2025</span>
      </p>
    </div>
  )
}
