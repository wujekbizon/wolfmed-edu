import AllTests from '@/components/AllTests'
import { fileData } from '@/server/fetchData'
import { getCurrentUser } from '@/server/user';
import { Metadata } from 'next'
import { redirect } from 'next/navigation';
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
    // decodeURIComponent is used to decode the category name because it is encoded in the URL, 
    // we are using polish letters in the category name
    const decodedCategory = decodeURIComponent(category)

    const user = await getCurrentUser()
    if (!user) redirect('/sign-in')

    // Merge tests if supporter, otherwise only official
    const tests = user.supporter
      ? await fileData.mergedGetTestsByCategory(decodedCategory, user.userId)
      : await fileData.getTestsByCategory(decodedCategory)

    return (
        <section className='flex w-full flex-col items-center gap-8 p-4 lg:p-16'>
            <Suspense fallback={<div>Loading...</div>}>
                <AllTests tests={tests} />
            </Suspense>
        </section>
    )
}
