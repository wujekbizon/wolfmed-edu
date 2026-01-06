import { Suspense } from "react";
import { Metadata } from "next";
import { auth } from '@clerk/nextjs/server'
import { fileData } from '@/server/fetchData'
import { getSupporterByUserId, getTestSessionDetails } from '@/server/queries'
import GenerateTests from "@/components/GenerateTests";
import { CategoryPageProps } from "@/types/categoryType";

export const metadata: Metadata = {
  title: 'Testy medyczne | Wolfmed',
  description: 'Rozwiązuj testy z kategorii medycznych',
}

async function TestsByCategoryContent(props: CategoryPageProps) {
  const { value: category } = await props.params
  const { sessionId } = await props.searchParams

  const decodedCategory = decodeURIComponent(category)

  const { userId } = await auth()
  const isSupporter = userId ? await getSupporterByUserId(userId) : false

  const categoryTests = isSupporter
    ? await fileData.mergedGetTestsByCategory(decodedCategory, userId || "")
    : await fileData.getTestsByCategory(decodedCategory)

  const sessionDetails = await getTestSessionDetails(sessionId);

  if (!categoryTests || categoryTests.length === 0) {
    return <p>Brak dostępnych testów. Proszę spróbować później.</p>
  }

  if (!sessionDetails) {
    return <p>Nie znaleziono szczegółów sesji testowej.</p>;
  }

  const { numberOfQuestions, durationMinutes } = sessionDetails
  return <GenerateTests tests={categoryTests} sessionId={sessionId} duration={durationMinutes} questions={numberOfQuestions} />;
}

export default function CategoryTestPage(props: CategoryPageProps) {
  return (
    <section className='flex w-full flex-col items-center gap-8 p-0 sm:p-4'>
      <Suspense fallback={<div className="animate-pulse">Ładowanie testu...</div>}>
        <TestsByCategoryContent params={props.params} searchParams={props.searchParams} />
      </Suspense>
    </section>
  );
}
