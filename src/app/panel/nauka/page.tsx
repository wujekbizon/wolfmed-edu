import { Metadata } from 'next'
import { getPopulatedCategories } from '@/helpers/populateCategories'
import { getMergedMaterials } from '@/helpers/mergeMaterials'
import LearningHubDashboard from '@/components/LearningHubDashboard'
import PdfPreviewModal from '@/components/PdfPreviewModal'
import VideoPreviewModal from '@/components/VideoPreviewModal'
import TextPreviewModal from '@/components/TextPreviewModal'
import UploadMaterialModal from '@/components/UploadMaterialModal'
import { getAllUserNotes, getMaterialsByUser } from '@/server/queries'
import type { NotesType } from '@/types/notesTypes'
import type { MaterialsType } from '@/types/materialsTypes'
import { getCurrentUser } from '@/server/user'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Baza pytań Nauka',
  description:
    'Baza testów z egzaminów i kursów medycznych',
  keywords: 'nauka, egzamin, testy, pytania, zagadnienia, baza',
}

export default async function NaukaPage() {
  const user = await getCurrentUser()
  if (!user) return null

  const [populatedCategories, userAllNotes, userMaterials] = await Promise.all([
    getPopulatedCategories(),
    getAllUserNotes(user.userId) as Promise<NotesType[]>,
    getMaterialsByUser(user.userId) as Promise<MaterialsType[]>,
  ])
  const materials = await getMergedMaterials(userMaterials)

  return (
    <section className='w-full h-full overflow-y-auto scrollbar-webkit p-4 lg:p-16 bg-linear-to-br from-zinc-50/80 via-rose-50/30 to-zinc-50/80'>
      <LearningHubDashboard materials={materials} categories={populatedCategories} notes={userAllNotes} isSupporter={user.supporter} />
      <PdfPreviewModal />
      <VideoPreviewModal />
      <TextPreviewModal />
      <UploadMaterialModal />
    </section>
  )
}
