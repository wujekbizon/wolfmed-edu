import { NUMBER_OF_TESTS } from '@/constants/testsNumbers'
import Image from 'next/image'

export default function LearningAssistant() {
  return (
    <div className="border-red-200/60 my-10 shadow-md shadow-zinc-500 animate-slideInDown opacity-0 [--slidein-delay:300ms] w-full lg:w-3/4 xl:w-2/3 bg-white gap-4 flex flex-row p-4 rounded-xl relative">
      <div className="h-20 min-w-20">
        <Image
          src="/guide2.png"
          width={150}
          height={150}
          alt="Asystent"
          className="w-full h-full object-cover rounded-full"
        />
      </div>
      <p className="text-sm xs:text-base text-zinc-900">
        Cześć, jestem <span className="font-semibold text-red-600">Fiolka!</span> Cieszę sie że znalazłaś/łeś czas na
        trochę nauki.
        <br /> Na tej stronie masz dostęp do wszystkich pytań. Wow, mamy ich naprawde bardzo dużo bo aż{' '}
        <span className="font-bold">{NUMBER_OF_TESTS}</span>.<br />
        Możesz przeglądać je po kolei badż skorzystać z prostej wyszukiwarki terminowej.
        <br />
        <span className="text-xs text-zinc-600">
          Na obecną chwilę pytania nie są skateryzowane , ale pracujemy nad tym!
        </span>
      </p>
    </div>
  )
}
