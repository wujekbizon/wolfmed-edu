import { Suspense } from 'react'
import type { Metadata } from 'next'
import TestResultContent from '@/components/TestResultContent'
import Loading from './loading'

export const metadata: Metadata = {
  title: 'Szczegóły wyniku testu',
  description: 'Sprawdź wynik testu i przejrzyj odpowiedzi.',
}

export default async function TestResultPage(props: {
  params: Promise<{ testId: string }>
}) {
  const { testId } = await props.params
  return <Suspense fallback={<Loading />}><TestResultContent testId={testId} /></Suspense>
}
