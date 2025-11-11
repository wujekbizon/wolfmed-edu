export function MessageListSkeleton() {
    return (
        <div className="space-y-6 animate-pulse">
            <div>
                <div className="h-8 w-64 bg-zinc-200 rounded" />
                <div className="h-5 w-40 bg-zinc-200 rounded mt-1" />
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-zinc-200">
                <div className="divide-y divide-zinc-200">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="p-6">
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="h-5 w-16 bg-zinc-200 rounded-full" />
                                        <div className="h-4 w-48 bg-zinc-200 rounded" />
                                        <div className="h-4 w-32 bg-zinc-200 rounded" />
                                    </div>
                                    <div className="h-4 w-full bg-zinc-200 rounded mb-2" />
                                    <div className="h-4 w-3/4 bg-zinc-200 rounded" />
                                </div>
                                <div className="flex gap-2">
                                    <div className="h-8 w-32 bg-zinc-200 rounded" />
                                    <div className="h-8 w-24 bg-zinc-200 rounded" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}