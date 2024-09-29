import Link from 'next/link'

export default function CustomMemberCard() {
  return (
    <div className="h-[400px] w-[95%] xs:w-[90%] md:w-[360px] hover:scale-105 bg-red-300  flex flex-col transition-all justify-between p-8 rounded-2xl  shadow-md shadow-zinc-600">
      <div className="flex w-full items-center gap-8 border-b border-zinc-100/50 pb-6">
        <div className="hidden xs:block w-20 h-20 rounded-2xl bg-zinc-800/40 relative overflow-hidden shadow-inner shadow-zinc-800">
          <div className="absolute right-[-8%] top-[-8%] w-10 h-10 rounded-full bg-white/70 shadow-md shadow-zinc-600"></div>
          <div className="absolute left-[-10%] bottom-[-16%] w-10 h-10 bg-white/70 shadow-md shadow-zinc-600"></div>
        </div>
        <div className="flex flex-col">
          <h2 className="text-2xl font-semibold">Biznes</h2>
          <h4 className="text-sm text-zinc-100">
            <span className="text-sm text-zinc-600">wycena</span> indywidualna
            <br />
            dla szkół policealnych
          </h4>
        </div>
      </div>
      <ul className="w-full h-full flex flex-col justify-center gap-4 text-lg">
        <li className=" text-zinc-100">
          <span className="mr-4">✔</span>
          Pakiet <span className="font-bold text-zinc-700">Premium Pro</span>
        </li>
        <li className=" text-zinc-100">
          {' '}
          <span className="mr-4">✔</span>
          <span className="font-bold text-zinc-700">AI ChatBot</span> agent
        </li>
        <li className="text-zinc-100">
          {' '}
          <span className="mr-4">✔</span>Kursy, <span className="font-bold text-zinc-700"> szkolenia</span> i więcej
        </li>
      </ul>
      <Link
        href="#contact"
        className="bg-zinc-600 py-4 rounded-lg text-center text-lg text-white hover:bg-zinc-800 transition-colors"
      >
        Skontaktuj się z nami
      </Link>
    </div>
  )
}
