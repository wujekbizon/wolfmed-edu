import { Suspense } from "react";
import { Metadata } from "next";
import { getTestSessionDetails, getTestsByCategory } from '@/server/queries'
import GenerateTests from "@/components/GenerateTests";
import { CategoryPageProps } from "@/types/categoryType";
import { CATEGORY_METADATA } from "@/constants/categoryMetadata";
import { getCurrentUser } from "@/server/user";
import { redirect } from "next/navigation";
import { checkCourseAccessAction } from "@/actions/course-actions";
import { getCourseForCategory } from "@/constants/courseCategoryMapping";
import { Test } from "@/types/dataTypes";

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

  // Check if this category requires specific course enrollment
  const requiredCourse = getCourseForCategory(decodedCategory)

  // If category is mapped to a course, check access
  if (requiredCourse && requiredCourse !== "opiekun-medyczny") {
    const courseAccess = await checkCourseAccessAction(requiredCourse)

    // If user doesn't have access to the required course, show access denied
    if (!courseAccess.hasAccess) {
      return (
        <div className="flex flex-col items-center gap-4 p-8">
          <h2 className="text-2xl font-bold text-red-600">Brak dostępu</h2>
          <p className="text-gray-600 text-center">
            Nie masz dostępu do tego kursu. Kup kurs, aby uzyskać dostęp do testów.
          </p>
        </div>
      )
    }
  }

  const categoryTests = await getTestsByCategory(decodedCategory) as Test[]

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
