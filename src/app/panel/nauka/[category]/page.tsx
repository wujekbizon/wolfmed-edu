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

// export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
//     const { category } = await params;
//     const categoryName = category
//         .replace(/-/g, ' ')
//         .split(' ')
//         .map(word => word.charAt(0).toUpperCase() + word.slice(1))
//         .join(' ');
//     return {
//         title: `Testy z kategorii: ${categoryName}`,
//         description: `Przygotuj się do egzaminu z testów z kategorii ${categoryName}.`,
//     };
// }

export default function CategoryPage(props: CategoryPageProps) {

    return (
        <section className='flex w-full flex-col items-center gap-8 p-4 lg:p-16'>
            <Suspense fallback={<div>Loading...</div>}>
                <CategoryContentWrapper params={props.params} />
            </Suspense>
        </section>
    )
}

async function CategoryContentWrapper(props: { params: Promise<{ category: string }> }) {
    const { category } = await props.params
    const decodedCategory = decodeURIComponent(category)

    if (decodedCategory === 'socjologia') {
        const isAdmin = await isUserAdmin()
        if (!isAdmin) redirect('/panel/nauka')
    }

    const user = await currentUser()
    const isSupporter = user?.id ? await getSupporterByUserId(user.id) : false

    const tests = isSupporter
        ? await fileData.mergedGetTestsByCategory(decodedCategory, user?.id)
        : await fileData.getTestsByCategory(decodedCategory)

    return <AllTests tests={tests} />
}
