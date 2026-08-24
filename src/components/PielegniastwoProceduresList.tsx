import ProceduresBrowser from '@/components/ProceduresBrowser'
import { toPielegniastwoProcedureBrowseItems } from '@/helpers/toPielegniastwoProcedureBrowseItems'
import type { PielegniastwoProcedure } from '@/types/pielegniastwoTypes'

interface Props {
  procedures: PielegniastwoProcedure[]
}

export default function PielegniastwoProceduresList({ procedures }: Props) {
  return (
    <ProceduresBrowser
      course='pielegniarstwo'
      procedures={toPielegniastwoProcedureBrowseItems(procedures)}
    />
  )
}
