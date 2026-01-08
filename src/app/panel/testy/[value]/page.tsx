import { Suspense } from "react";
import { Metadata } from "next";
import { fileData } from '@/server/fetchData'
import { getTestSessionDetails } from '@/server/queries'
import GenerateTests from "@/components/GenerateTests";
import { CategoryPageProps } from "@/types/categoryType";
import { CATEGORY_METADATA } from "@/constants/categoryMetadata";
import { getCurrentUser } from "@/server/user";
import { redirect } from "next/navigation";

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
  const decodedCategory = decodeURIComponent(category)

  const user = await getCurrentUser()
  if (!user) redirect('/sign-in')

  const categoryTests = user.supporter
    ? await fileData.mergedGetTestsByCategory(decodedCategory, user.userId)
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
