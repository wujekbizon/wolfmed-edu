import TestLoader from '@/components/TestsLoader'
import { loadingProceduresData } from '@/constants/loadingProceduresData'

export default function Loading(props: { isLoading?: boolean }) {
  return (
    <section className="flex flex-col items-center gap-8 px-1 sm:px-4 py-4  w-full h-full">
      <div className="w-full lg:w-3/4 xl:w-2/3 flex flex-col gap-6 py-2 pr-2 overflow-y-auto scrollbar-webkit">
        {loadingProceduresData.map(({ data: { name, procedure } }) => (
          <div className="border p-5 rounded-lg shadow-md border-red-200/60 bg-[#ffb1b1] shadow-zinc-500">
            <h2 className="text-2xl mb-2">{name}</h2>
            <p className="text-zinc-700 mb-4">{procedure}</p>
            <button
              disabled={props.isLoading}
              className="flex justify-center bg-[#ffc5c5] disabled:pointer-events-none disabled:opacity-50 items-center px-2 py-1 transition-all hover:scale-95 rounded-md border border-red-100/50 hover:border-zinc-900 hover:shadow-sm hover:bg-[#f58a8a] shadow-md shadow-zinc-500"
            >
              {props.isLoading && 'Wczytuje Algorytm...'}
            </button>
          </div>
        ))}
        <TestLoader />
      </div>
    </section>
  )
}
