import { Suspense } from 'react'
import { fileData } from '@/server/fetchData'
import { Metadata } from 'next'
import { getPopulatedCategories } from '@/helpers/populateCategories'
import { getMergedMaterials } from '@/helpers/mergeMaterials'
import LearningHubDashboard from '@/components/LearningHubDashboard'
import LearningHubDashboardSkeleton from '@/components/skeletons/LearningHubDashboardSkeleton'
import PdfPreviewModal from '@/components/PdfPreviewModal'
import VideoPreviewModal from '@/components/VideoPreviewModal'
import TextPreviewModal from '@/components/TextPreviewModal'
import UploadMaterialModal from '@/components/UploadMaterialModal'
import { getAllUserNotes, getMaterialsByUser, getSupporterByUserId } from '@/server/queries'
import { currentUser } from '@clerk/nextjs/server'
import type { NotesType } from '@/types/notesTypes'
import type { MaterialsType } from '@/types/materialsTypes'

export const metadata: Metadata = {
  title: 'Baza pytań Nauka',
  description:
    'Baza testów z egzaminów i kursów medycznych',
  keywords: 'nauka, egzamin, testy, pytania, zagadnienia, baza',
}

async function LearningHubWithData() {
  const user = await currentUser()
  const isSupporter = user?.id ? await getSupporterByUserId(user?.id) : false

  const populatedCategories = await getPopulatedCategories(
    fileData,
    isSupporter ? (user?.id || undefined) : undefined
  )

  const userAllNotes = user ? (await getAllUserNotes(user.id) as NotesType[]) : []

  const userMaterials = user ? (await getMaterialsByUser(user.id) as MaterialsType[]) : []
  const materials = await getMergedMaterials(userMaterials)

  return (
    <LearningHubDashboard
      materials={materials}
      categories={populatedCategories}
      notes={userAllNotes}
      isSupporter={isSupporter}
    />
  )
}

export default function NaukaPage() {
  return (
    <section className='w-full h-full overflow-y-auto scrollbar-webkit p-4 lg:p-16 bg-linear-to-br from-zinc-50/80 via-rose-50/30 to-zinc-50/80'>
      <Suspense fallback={<LearningHubDashboardSkeleton />}>
        <LearningHubWithData />
      </Suspense>
      <PdfPreviewModal />
      <VideoPreviewModal />
      <TextPreviewModal />
      <UploadMaterialModal />
    </section>
  )
}
