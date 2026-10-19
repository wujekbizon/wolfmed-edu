import { Suspense } from 'react'
import { Metadata } from 'next'
import NaukaHubContent from '@/components/NaukaHubContent'
import NaukaCategoriesSkeleton from '@/components/skeletons/NaukaCategoriesSkeleton'
import PdfPreviewModal from '@/components/PdfPreviewModal'
import TextPreviewModal from '@/components/TextPreviewModal'
import UploadMaterialModal from '@/components/UploadMaterialModal'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Centrum Nauki',
  description: 'Kategorie, pracownia AI i biblioteka materiałów do nauki',
  keywords: 'nauka, egzamin, testy, pytania, zagadnienia, baza'
}

export default function NaukaPage() {
  return (
    <section className='min-w-0 w-full px-4 pb-10 lg:px-10 bg-linear-to-br from-zinc-50/80 via-rose-50/30 to-zinc-50/80'>
      <Suspense fallback={<NaukaCategoriesSkeleton />}>
        <NaukaHubContent />
      </Suspense>

      <PdfPreviewModal />
      <TextPreviewModal />
      <UploadMaterialModal />
    </section>
  )
}
