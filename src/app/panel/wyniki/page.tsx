import { Suspense } from 'react'
import type { Metadata } from 'next'
import CompletedTestsContent from '@/components/CompletedTestsContent'
import CompletedTestsListSkeleton from '@/components/skeletons/CompletedTestsListSkeleton'
import PanelWolfekSection from '@/components/wolfek/PanelWolfekSection'

export const metadata: Metadata = {
  title: 'Twoje Wyniki Testów',
  description: 'Sprawdź swoje wyniki testów i popraw się w opiece medycznej!',
  keywords:
    'opiekun, med-14, egzamin, testy, pytania, zagadnienia, medyczno-pielęgnacyjnych, opiekuńczych, baza, wyniki',
}

export const dynamic = 'force-dynamic'

export default function TestsResultPage() {
  return (
    <>
      <Suspense fallback={<CompletedTestsListSkeleton />}>
        <CompletedTestsContent />
      </Suspense>
      <Suspense fallback={null}>
        <PanelWolfekSection route="panel.results" />
      </Suspense>
    </>
  )
}
