import { Success } from '@/app/_components/Success'
import { requireUser } from '@/helpers/requireUser'

export default async function SuccessPage() {
  await requireUser()

  return <Success />
}
