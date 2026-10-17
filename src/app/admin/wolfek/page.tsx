import { Suspense } from 'react'
import WolfekAdminContent from '@/components/admin/wolfek/WolfekAdminContent'
import WolfekAdminSkeleton from '@/components/skeletons/WolfekAdminSkeleton'
import type { WolfekAdminPageProps } from '@/types/wolfekAdminTypes'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Wolfek | Admin' }

export default function WolfekAdminPage(props: WolfekAdminPageProps) {
  return <Suspense fallback={<WolfekAdminSkeleton />}><WolfekAdminContent {...props} /></Suspense>
}
