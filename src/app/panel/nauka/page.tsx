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
import { CATEGORY_METADATA } from '@/constants/categoryMetadata'
import { checkCourseAccessAction } from '@/actions/course-actions'
import { hasAccessToTier } from '@/lib/accessTiers'

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

  // Filter categories based on course ownership and tier access
  const categoriesWithAccess = await Promise.all(
    populatedCategories.map(async (cat) => {
      const metadata = CATEGORY_METADATA[cat.value]
      if (!metadata?.course) return { ...cat, hasAccess: true }

      const courseAccess = await checkCourseAccessAction(metadata.course)

      if (!courseAccess.hasAccess) {
        return { ...cat, hasAccess: false }
      }

      const hasTierAccess = hasAccessToTier(
        courseAccess.accessTier || 'free',
        metadata.requiredTier
      )

      return { ...cat, hasAccess: hasTierAccess }
    })
  )

  // Only show categories user has access to
  const accessibleCategories = categoriesWithAccess.filter(cat => cat.hasAccess)

  return (
    <section className='w-full h-full overflow-y-auto scrollbar-webkit p-4 lg:p-16 bg-linear-to-br from-zinc-50/80 via-rose-50/30 to-zinc-50/80'>
      <LearningHubDashboard materials={materials} categories={accessibleCategories} notes={userAllNotes} isSupporter={user.supporter} />
      <PdfPreviewModal />
      <VideoPreviewModal />
      <TextPreviewModal />
      <UploadMaterialModal />
    </section>
  )
}
