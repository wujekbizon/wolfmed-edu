import { Success } from '../_components/Success'

export default async function SuccessPage({ searchParams }: { searchParams: { session_id: string } }) {
  return <Success sessionId={searchParams.session_id} />
}
