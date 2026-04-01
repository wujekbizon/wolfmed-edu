import Link from 'next/link'

interface CategoryHeaderProps {
  categoryName: string
  categoryImage?: string
  description: string
  popularity: string
  testCount: number
}

export default function CategoryHeader({
  categoryName,
  categoryImage,
  description,
  popularity,
  testCount,
}: CategoryHeaderProps) {
  return (
    <>
      <nav className='mb-6 text-sm'>
        <Link href='/panel/kursy' className='text-blue-600 hover:underline'>
          Moje Kursy
        </Link>
        <span className='mx-2 text-gray-400'>/</span>
        <span className='text-gray-600'>{categoryName}</span>
      </nav>

      <div className='bg-white rounded-lg shadow-md overflow-hidden mb-6'>
        <div className='p-6 md:p-8'>
          <div className='flex items-start gap-6'>
            {categoryImage && (
              <img
                src={categoryImage}
                alt={categoryName}
                className='w-24 h-24 md:w-32 md:h-32 rounded-lg object-cover'
              />
            )}
            <div className='flex-1'>
              <h1 className='text-3xl font-bold mb-2'>{categoryName}</h1>
              <p className='text-gray-600 mb-4'>{description}</p>

              <div className='flex flex-wrap gap-4 text-sm'>
                <div className='flex items-center gap-2'>
                  <span className='font-semibold'>Popularność:</span>
                  <span className='text-gray-600'>{popularity}</span>
                </div>
                <div className='flex items-center gap-2'>
                  <span className='font-semibold'>Liczba pytań:</span>
                  <span className='text-gray-600'>{testCount}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
