import UserDashboard from '@/components/UserDashboard'
import { getUserUsername } from '@/server/queries'
import { currentUser } from '@clerk/nextjs/server'

export default async function TestsPage() {
  const user = await currentUser()
  if (!user) {
    return <p>Not signed in</p>
  }
  const username = (await getUserUsername(user.id)) as string

  return <UserDashboard username={username} />
}
