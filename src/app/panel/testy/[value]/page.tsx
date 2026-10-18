import { Suspense } from "react";
import TestsByCategory from '@/components/TestsByCategory'
import PracticeTestSkeleton from '@/components/skeletons/PracticeTestSkeleton'
import { Metadata } from "next";
import { CategoryPageProps } from "@/types/categoryType";
import { CATEGORY_METADATA } from "@/constants/categoryMetadata";

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

export default async function CategoryTestPage(props: CategoryPageProps) {
  const { value } = await props.params
  const { sessionId } = await props.searchParams;

  return (
    <section className='flex w-full flex-col items-center gap-8 p-0 sm:p-4'>
      <Suspense fallback={<PracticeTestSkeleton />}>
        <TestsByCategory category={value} sessionId={sessionId} />
      </Suspense>
    </section>
  );
}
