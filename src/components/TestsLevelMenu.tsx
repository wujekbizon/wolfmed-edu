import { testsMenu } from '@/constants/testsMenu'
import RandomTestButon from './RandomTestButton'

export default function TestsLevelMenu() {
  return (
    <div className="mt-10 flex w-full flex-col items-center gap-4 rounded-lg border border-border/40 bg-zinc-950 p-4 sm:mt-20 xl:w-5/6">
      <h4 className="p-0 text-center text-2xl text-amber-400 sm:p-4 sm:text-3xl ">Select your test level.</h4>
      <div className="flex w-full flex-col items-center justify-between gap-4 rounded-xl bg-neutral-800 p-4 sm:gap-2">
        <div className="hidden w-full items-center justify-evenly sm:flex">
          {testsMenu.map((m) => (
            <p className="w-128 p-0 text-center text-sm text-muted-foreground md:p-4" key={m.testTitle}>
              <span className=" text-white">{m.testTitle}</span> - {m.number.toString()} questions{' '}
            </p>
          ))}
        </div>

        <div className="flex w-full flex-col items-center justify-evenly gap-4 sm:flex-row">
          {testsMenu.map((m) => (
            <RandomTestButon key={m.testTitle} number={m.number}>
              {m.testTitle}
            </RandomTestButon>
          ))}
        </div>
      </div>
    </div>
  )
}
