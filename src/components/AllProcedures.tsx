import ProceduresBrowser from '@/components/ProceduresBrowser'
import { toOpiekunProcedureBrowseItems } from '@/helpers/toOpiekunProcedureBrowseItems'
import type { Procedure } from '@/types/dataTypes'

export default function AllProcedures(props: { procedures: Procedure[] }) {
  return (
    <ProceduresBrowser
      course='opiekun-medyczny'
      procedures={toOpiekunProcedureBrowseItems(props.procedures)}
    />
  )
}
