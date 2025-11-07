import { Suspense } from "react";
import { Metadata } from "next";
import { auth } from '@clerk/nextjs/server'
import { fileData } from '@/server/fetchData'
import { getSupporterByUserId, getTestSessionDetails } from '@/server/queries'
import GenerateTests from "@/components/GenerateTests";
import { CategoryPageProps } from "@/types/categoryType";
import { CATEGORY_METADATA } from "@/constants/categoryMetadata";

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { value: category } = await params;
  const metadata = CATEGORY_METADATA[category as keyof typeof CATEGORY_METADATA];

  if (!metadata) {
    return CATEGORY_METADATA["opiekun-medyczny"]
  }

  return {
    title: metadata.title,
    description: metadata.description,
    keywords: metadata.keywords.join(", "),
  };
}

async function TestsByCategory({ category, sessionId }: { category: string, sessionId: string }) {
  const { userId } = await auth()
  const isSupporter = userId ? await getSupporterByUserId(userId) : false

  // Merge tests if supporter, otherwise only official
  const categoryTests = isSupporter
    ? await fileData.mergedGetTestsByCategory(decodeURIComponent(category), userId)
    : await fileData.getTestsByCategory(decodeURIComponent(category))

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
