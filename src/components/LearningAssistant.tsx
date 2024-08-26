import { NUMBER_OF_TESTS } from '@/constants/testsNumbers'
import Image from 'next/image'

export default function LearningAssistant() {
  return (
    <div className="border-red-200/60 my-14 shadow-md shadow-zinc-500 w-full lg:w-3/4 xl:w-1/2 items-center bg-white gap-4 flex-col flex sm:flex-row p-4 rounded-xl relative">
      <div className="h-24 min-w-24">
        <Image
          src="/guide2.png"
          width={150}
          height={150}
          alt="Asystent"
          className="w-24 sm:w-full h-full object-cover rounded-full sm:rounded-xl"
        />
      </div>
      <p className="text-sm xs:text-base text-zinc-900">
        Cześć, jestem <span className="font-semibold text-red-600">Fiolka!</span> Cieszę sie że znalazłaś/łeś czas na
        trochę nauki.
        <br /> Na tej stronie masz dostęp do wszystkich pytań. Wow, mamy ich naprawde bardzo dużo bo aż{' '}
        <span className="font-bold">{NUMBER_OF_TESTS}</span>.<br />
        Możesz przeglądać je po kolei badż skorzystać z prostej wyszukiwarki terminowej.
        <br />
        {/* <span className="text-xs text-zinc-600">
          Na obecną chwilę pytania nie są skateryzowane , ale pracujemy nad tym!
        </span> */}
      </p>
    </div>
  )
}
