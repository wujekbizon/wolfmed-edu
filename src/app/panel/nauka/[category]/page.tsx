import AllTests from '@/components/AllTests'
import AllTestsSkeleton from '@/components/skeletons/AllTestsSkeleton'
import { fileData } from '@/server/fetchData'
import { getSupporterByUserId } from '@/server/queries';
import { currentUser } from '@clerk/nextjs/server';
import { Suspense } from 'react';

interface CategoryPageProps {
    params: Promise<{ category: string }>;
}

export async function generateMetadata() {
    return {
        title: `Testy z kategorii medycznej / opiekun-medyczny`,
        description: `Przygotuj się do egzaminu z testów z kategorii medycznej / opiekun-medyczny.`,
    };
}

export default function CategoryPage(props: CategoryPageProps) {
    return (
        <section className='flex w-full flex-col items-center gap-8 p-4 lg:p-16'>
            <Suspense fallback={<AllTestsSkeleton />}>
                <CategoryContentWrapper params={props.params} />
            </Suspense>
        </section>
    )
}

async function CategoryContentWrapper(props: { params: Promise<{ category: string }> }) {
    const { category } = await props.params
    const decodedCategory = decodeURIComponent(category)

    const user = await currentUser()
    const isSupporter = user?.id ? await getSupporterByUserId(user.id) : false

    const tests = isSupporter
        ? await fileData.mergedGetTestsByCategory(decodedCategory, user?.id)
        : await fileData.getTestsByCategory(decodedCategory)

    return <AllTests tests={tests} />
}
