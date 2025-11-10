import AllTests from '@/components/AllTests'
import { fileData } from '@/server/fetchData'
import { getSupporterByUserId } from '@/server/queries';
import { currentUser } from '@clerk/nextjs/server';
import { Metadata } from 'next'
import { Suspense } from 'react';

interface CategoryPageProps {
    params: Promise<{ category: string }>;
}

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
    const { category } = await params;
    const categoryName = category
        .replace(/-/g, ' ')
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    return {
        title: `Testy z kategorii: ${categoryName}`,
        description: `Przygotuj się do egzaminu z testów z kategorii ${categoryName}.`,
    };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
    const { category } = await params;
    const user = await currentUser()
    const isSupporter = user?.id ? await getSupporterByUserId(user.id) : false

    // decodeURIComponent is used to decode the category name because it is encoded in the URL, we are using polish letters in the category name
    // Merge tests if supporter, otherwise only official
    const tests = isSupporter
      ? await fileData.mergedGetTestsByCategory(decodeURIComponent(category), user?.id)
      : await fileData.getTestsByCategory(decodeURIComponent(category))

    return (
        <section className='flex w-full flex-col items-center gap-8 p-4 lg:p-16'>
            <Suspense fallback={<div>Loading...</div>}>
                <AllTests tests={tests} />
            </Suspense>
        </section>
    )
}
