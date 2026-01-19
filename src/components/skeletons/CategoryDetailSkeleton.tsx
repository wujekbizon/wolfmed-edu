export default function CategoryDetailSkeleton() {
  return (
    <div className='max-w-6xl mx-auto animate-pulse'>
      {/* Breadcrumb skeleton */}
      <div className='mb-6 h-4 w-48 bg-gray-200 rounded'></div>

      {/* Header skeleton */}
      <div className='bg-white rounded-lg shadow-md overflow-hidden mb-6'>
        <div className='p-6 md:p-8'>
          <div className='flex items-start gap-6'>
            <div className='w-24 h-24 md:w-32 md:h-32 bg-gray-200 rounded-lg'></div>
            <div className='flex-1 space-y-3'>
              <div className='h-8 bg-gray-200 rounded w-64'></div>
              <div className='h-4 bg-gray-200 rounded w-full'></div>
              <div className='h-4 bg-gray-200 rounded w-3/4'></div>
              <div className='flex gap-4 mt-4'>
                <div className='h-4 bg-gray-200 rounded w-32'></div>
                <div className='h-4 bg-gray-200 rounded w-32'></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Course info skeleton */}
      <div className='bg-white rounded-lg shadow-md p-6 md:p-8 mb-6'>
        <div className='grid md:grid-cols-2 gap-6 mb-6'>
          <div className='space-y-3'>
            <div className='h-4 bg-gray-200 rounded w-48'></div>
            <div className='h-4 bg-gray-200 rounded w-32'></div>
            <div className='h-4 bg-gray-200 rounded w-40'></div>
          </div>
          <div className='space-y-3'>
            <div className='h-4 bg-gray-200 rounded w-48'></div>
            <div className='h-4 bg-gray-200 rounded w-full'></div>
          </div>
        </div>
        <div className='space-y-3'>
          <div className='h-4 bg-gray-200 rounded w-48'></div>
          <div className='h-4 bg-gray-200 rounded w-full'></div>
          <div className='h-4 bg-gray-200 rounded w-full'></div>
        </div>
      </div>

      {/* Learning outcomes skeleton */}
      <div className='bg-white rounded-lg shadow-md p-6 md:p-8 mb-6'>
        <div className='h-6 bg-gray-200 rounded w-48 mb-6'></div>
        <div className='space-y-3'>
          <div className='h-16 bg-gray-100 rounded'></div>
          <div className='h-16 bg-gray-100 rounded'></div>
          <div className='h-16 bg-gray-100 rounded'></div>
        </div>
      </div>

      {/* Program content skeleton */}
      <div className='bg-white rounded-lg shadow-md p-6 md:p-8 mb-6'>
        <div className='h-6 bg-gray-200 rounded w-48 mb-6'></div>
        <div className='space-y-3'>
          <div className='h-12 bg-gray-100 rounded'></div>
          <div className='h-12 bg-gray-100 rounded'></div>
          <div className='h-12 bg-gray-100 rounded'></div>
        </div>
      </div>

      {/* CTA skeleton */}
      <div className='bg-white rounded-lg shadow-md p-8'>
        <div className='h-6 bg-gray-200 rounded w-48 mb-4'></div>
        <div className='h-4 bg-gray-200 rounded w-full mb-6'></div>
        <div className='h-12 bg-gray-200 rounded w-48'></div>
      </div>
    </div>
  )
}
