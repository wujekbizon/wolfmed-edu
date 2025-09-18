import { Suspense } from "react";
import { Metadata } from "next";
import { fileData } from '@/server/fetchData'
import GenerateTests from "@/components/GenerateTests";
import { CategoryPageProps } from "@/types/categoryType";
import { CATEGORY_METADATA } from "@/constants/categoryMetadata";

export const experimental_ppr = true;

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { value: category } = await params;

  const metadata = CATEGORY_METADATA[category as keyof typeof CATEGORY_METADATA];

  if (!metadata) {
    return CATEGORY_METADATA["opiekun-medyczny"];
  }

  return {
    title: metadata.title,
    description: metadata.description,
    keywords: metadata.keywords.join(", "),
  };
}

async function TestsByCategory({ category }: { category: string }) {
  const tests = await fileData.getTestsByCategory(category)

  if (!tests || tests.length === 0) {
    return <p>Brak dostępnych testów. Proszę spróbować później.</p>
  }

  return <GenerateTests tests={tests} />;
}

export default async function CategoryTestPage(props: CategoryPageProps) {
  const { value } = await props.params
  return (
    <section className='flex w-full flex-col items-center gap-8 p-0 sm:p-4'>

      <Suspense>
        <TestsByCategory category={value} />
      </Suspense>
    </section>
  );
}
