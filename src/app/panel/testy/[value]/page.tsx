import { Suspense } from "react";
import { Metadata } from "next";
import { fileData } from '@/server/fetchData'
import GenerateTests from "@/components/GenerateTests";
import { CategoryPageProps } from "@/types/categoryType";
import { CATEGORY_METADATA } from "@/constants/categoryMetadata";
import { getTestSessionDetails } from '@/server/queries';

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
  const categoryTests = await fileData.getTestsByCategory(decodeURIComponent(category))
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

export default async function CategoryTestPage(props: CategoryPageProps & { searchParams: { sessionId: string } }) {
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
