export default function ChallengesListSkeleton() {
    return (
      <div className="container mx-auto p-6 animate-pulse">
        <div className="mb-8">
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
        </div>
        <div className="mb-8">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-full w-full"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mt-2"></div>
        </div>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div 
              key={i} 
              className="border border-gray-200 dark:border-gray-700 rounded-lg p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                </div>
                <div className="h-6 w-6 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
              </div>
              
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/6"></div>
              </div>
              <div className="mt-4">
                <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }