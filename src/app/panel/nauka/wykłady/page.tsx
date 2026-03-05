import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/server/user'
import { checkPremiumAccessAction } from '@/actions/course-actions'
import { getLecturesByUser } from '@/server/queries'
import LectureLibrary from '@/components/LectureLibrary'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Wykłady | Wolfmed',
  description: 'Twoje zapisane wykłady audio',
}

export default async function WykladyPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/sign-in')

  const isPremium = await checkPremiumAccessAction()
  if (!isPremium) redirect('/panel/nauka')

  const lectures = await getLecturesByUser(user.userId)

  return <LectureLibrary lectures={lectures} />
}
