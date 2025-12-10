import AllTests from '@/components/AllTests'
import { fileData } from '@/server/fetchData'
import { getSupporterByUserId } from '@/server/queries';
import { currentUser } from '@clerk/nextjs/server';
import { Metadata } from 'next'
import { Suspense } from 'react';
import { isUserAdmin } from '@/lib/adminHelpers'
import { redirect } from 'next/navigation'

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
    const decodedCategory = decodeURIComponent(category)

    // Protect socjologia
    if (decodedCategory === 'socjologia') {
        const isAdmin = await isUserAdmin()
        if (!isAdmin) redirect('/panel/nauka')
    }

    const user = await currentUser()
    const isSupporter = user?.id ? await getSupporterByUserId(user.id) : false

    // Merge tests if supporter, otherwise only official
    const tests = isSupporter
      ? await fileData.mergedGetTestsByCategory(decodedCategory, user?.id)
      : await fileData.getTestsByCategory(decodedCategory)

    return (
        <section className='flex w-full flex-col items-center gap-8 p-4 lg:p-16'>
            <Suspense fallback={<div>Loading...</div>}>
                <AllTests tests={tests} />
            </Suspense>
        </section>
    )
}
