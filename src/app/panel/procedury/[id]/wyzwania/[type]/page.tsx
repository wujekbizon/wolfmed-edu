import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { fileData } from '@/server/fetchData'
import { ChallengeType } from '@/types/challengeTypes'
import OrderStepsChallenge from '@/components/challenges/OrderStepsChallenge'
import QuizChallenge from '@/components/challenges/QuizChallenge'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Wyzwanie Procedury',
  description: 'Rozwiąż wyzwanie aby zdobyć postęp',
}

interface Props {
  params: Promise<{ id: string; type: string }>
}

export default async function ChallengeTypePage({ params }: Props) {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const { id: procedureId, type: challengeType } = await params

  // Get procedure data
  const procedures = await fileData.getAllProcedures()
  const procedure = procedures.find((p) => p.id === procedureId)

  if (!procedure) {
    redirect('/panel/procedury')
  }

  // Render appropriate challenge based on type
  switch (challengeType) {
    case ChallengeType.ORDER_STEPS:
      return <OrderStepsChallenge procedure={procedure} />

    case ChallengeType.KNOWLEDGE_QUIZ:
      return <QuizChallenge procedure={procedure} />

    case ChallengeType.VISUAL_RECOGNITION:
    case ChallengeType.SPOT_ERROR:
    case ChallengeType.SCENARIO_BASED:
      // For MVP, show placeholder
      return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
          <div className="bg-zinc-800 p-8 rounded-2xl max-w-md text-center">
            <h2 className="text-2xl font-bold text-white mb-4">
              Wyzwanie w budowie
            </h2>
            <p className="text-white mb-6">
              To wyzwanie będzie dostępne wkrótce.
            </p>
            <a
              href={`/panel/procedury/${procedureId}/wyzwania`}
              className="inline-block px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
            >
              ← Powrót do listy wyzwań
            </a>
          </div>
        </div>
      )

    default:
      redirect(`/panel/procedury/${procedureId}/wyzwania`)
  }
}
