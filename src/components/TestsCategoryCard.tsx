import Image from "next/image";
import StartTestForm from "./StartTestForm";

export default async function TestsCategoryCard(props: {
  item: { category: string; value: string, count: number };
}) {
  
  return (
    <div className="relative flex flex-col lg:flex-row min-h-[400px] w-full p-5 overflow-hidden rounded-xl bg-zinc-800 transition-all duration-300">
      <div className="relative h-72 lg:h-full w-full lg:w-1/3 overflow-hidden rounded-lg">
        <Image
          src="https://utfs.io/a/zw3dk8dyy9/UVAwLrIxs2k5hAALGCKaPSlWXcFVLft4M8kAgI2ECx19u7JN"
          alt="Opiekun Medyczny Test"
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover h-fit w-full transition-transform duration-300 opacity-75 hover:opacity-100"
          priority
        />
      </div>
      <div className="relative z-10 flex w-full lg:w-2/3 flex-col justify-between p-0 lg:p-6 pt-10">
        <div className="flex flex-col items-start">
          <p className="rounded-full bg-green-500/20 px-3 py-1 text-xs font-semibold text-green-400 border border-green-500/30 mb-2">
            Dostępny online
          </p>
          <h3 className="text-4xl font-extrabold text-white drop-shadow-md leading-tight">
            {props.item.category}
          </h3>
          <p className="mt-2 text-zinc-300 text-base leading-relaxed">
            Przygotuj się do egzaminu Opiekuna Medycznego z naszymi
            kompleksowymi testami i pytaniami. Setki pytań, trzy poziomy
            trudności, które pomogą Ci w 100% przygotować sie do egzaminu
            państwowego i zdać za pierwszym razem!
          </p>
        </div>

        <div className="mt-4 flex items-center justify-start">
          <p className="text-zinc-200 text-base ">
            Wszystkie dostępne pytania:
            <span className="text-xl font-bold text-red-300 mx-2">
              {props.item.count}
            </span>
            <span className="text-zinc-300 text-base">pytań</span>
          </p>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4 text-sm text-zinc-400">
          <p className="flex items-center">
            <span className="text-red-300 text-lg font-bold mr-2">
              Bardzo popularny
            </span>
          </p>
          <p className="flex items-center">
            <span className="text-red-300 text-lg font-bold mr-2">25 min</span>
            czas trwania
          </p>
        </div>
        <div className="mt-8 w-full">
          <StartTestForm category={props.item.value} />
        </div>
      </div>
    </div>
  );
}
