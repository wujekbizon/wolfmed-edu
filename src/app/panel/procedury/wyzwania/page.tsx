import RandomProcedureChallenge from '@/components/RandomProcedureChallenge'
import { Metadata } from 'next'

export const dynamic = 'force-static'

export const metadata: Metadata = {
  title: 'Wyzwanie Losowej Procedury',
  description: 'Sprawdź swoją wiedzę o procedurach medycznych w losowym wyzwaniu',
}
export default function RandomProcedurePage() {
  return <RandomProcedureChallenge />
}
