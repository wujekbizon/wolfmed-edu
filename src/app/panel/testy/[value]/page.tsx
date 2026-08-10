import { Suspense } from "react";
import { Metadata } from "next";
import { getTestSessionDetails } from '@/server/queries'
import GenerateTests from "@/components/GenerateTests";
import { CategoryPageProps } from "@/types/categoryType";
import { CATEGORY_METADATA } from "@/constants/categoryMetadata";
import { getCurrentUser } from "@/server/user";
import { redirect } from "next/navigation";
import { getSessionQuestions } from '@/server/testSessionQuestions'

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { value: category } = await params;
  const metadata = CATEGORY_METADATA[category as keyof typeof CATEGORY_METADATA];

  if (!metadata) {
    return CATEGORY_METADATA["opiekun-medyczny"] ?? { title: "", description: "", keywords: "" }
  }

  return {
    title: metadata.title,
    description: metadata.description,
    keywords: metadata.keywords?.join(", "),
  };
}

async function TestsByCategory({ category, sessionId }: { category: string, sessionId: string }) {
  const decodedCategory = decodeURIComponent(category)

  const user = await getCurrentUser()
  if (!user) redirect('/sign-in')

  const sessionDetails = await getTestSessionDetails(sessionId, user.userId);

  if (
    !sessionDetails
    || sessionDetails.category !== decodedCategory
    || sessionDetails.status !== 'ACTIVE'
    || sessionDetails.expiresAt < new Date()
  ) {
    return <p>Nie znaleziono szczegółów sesji testowej.</p>;
  }

  const { numberOfQuestions, durationMinutes } = sessionDetails
  const sessionTests = await getSessionQuestions(
    user.userId,
    sessionDetails.category,
    numberOfQuestions,
    sessionId
  )

  if (sessionTests.length !== numberOfQuestions) {
    return <p>Brak dostępnych testów. Proszę spróbować później.</p>
  }

  const questions = sessionTests.map((test) => ({
    id: test.id,
    data: {
      question: test.data.question,
      answers: test.data.answers.map(({ option }) => ({ option })),
    },
  }))

  return <GenerateTests tests={questions} sessionId={sessionId} duration={durationMinutes} />;
}

export default async function CategoryTestPage(props: CategoryPageProps) {
  const { value } = await props.params
  const { sessionId } = await props.searchParams;

  return (
    <section className='flex w-full flex-col items-center gap-8 p-0 sm:p-4'>
      <Suspense>
        <TestsByCategory category={value} sessionId={sessionId} />
      </Suspense>
    </section>
  );
}
