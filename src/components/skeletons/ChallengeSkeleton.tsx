export default function ChallengeSkeleton() {
    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-4xl mx-auto">
                <div className="mb-8 space-y-4">
                    <div className="h-8 w-3/4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                    <div className="h-4 w-1/2 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 space-y-6">
                    <div className="space-y-3">
                        <div className="h-6 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                        <div className="h-6 w-5/6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                        <div className="h-6 w-4/6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                    </div>
                    <div className="space-y-4 mt-8">
                        {[1, 2, 3, 4].map((i) => (
                            <div
                                key={i}
                                className="h-16 w-full bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"
                            />
                        ))}
                    </div>
                    <div className="flex justify-end mt-8">
                        <div className="h-12 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                    </div>
                </div>
            </div>
        </div>
    )
}