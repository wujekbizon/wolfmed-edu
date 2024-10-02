import { testsMenu } from '@/constants/testsMenu'
import RandomTestButon from './RandomTestButton'

export default function TestsLevelMenu(props: { isLoading?: boolean }) {
  return (
    <div className="flex w-full flex-col items-center gap-4 rounded-2xl border border-red-200/60 bg-white shadow-md shadow-zinc-500 p-5 sm:p-8 lg:w-3/4 xl:w-2/3">
      <h4 className="p-0 text-center text-2xl text-zinc-900 sm:p-4 sm:text-3xl ">Wybierz poziom testu.</h4>
      <div className="flex w-full flex-col justify-center gap-4 md:flex-row">
        {testsMenu.map((m) => (
          <div key={m.testTitle} className="gap-2 flex flex-col ">
            <p className="text-center text-sm text-zinc-500" key={m.testTitle}>
              {m.number.toString()} pytań
            </p>
            <RandomTestButon disabled={props.isLoading ? true : false} number={m.number}>
              {props.isLoading ? 'Wczytuje testy...' : m.testTitle}
            </RandomTestButon>
          </div>
        ))}
      </div>
    </div>
  )
}
