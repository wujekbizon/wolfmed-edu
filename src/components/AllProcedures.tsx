import { Procedure } from '@/types/dataTypes'

export default function AllProcedures(props: { procedures: Procedure[] }) {
  return (
    <section className="flex flex-col items-center gap-8 px-1 sm:px-4 w-full h-full overflow-y-auto scrollbar-webkit">
      <div>
        {props.procedures.map((procedure) => (
          <h2 key={procedure.data.name}>{procedure.data.name}</h2>
        ))}
      </div>
    </section>
  )
}
