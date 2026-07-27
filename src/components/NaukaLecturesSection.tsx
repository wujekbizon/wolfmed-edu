import LecturesSection from './LecturesSection'
import { getLecturesByUser } from '@/server/queries'
import { getIsPremium } from '@/server/premium'

export default async function NaukaLecturesSection({ userId }: { userId: string }) {
  const isPremium = await getIsPremium()
  if (!isPremium) return null

  const lectures = await getLecturesByUser(userId)

  return <LecturesSection lectures={lectures} />
}
