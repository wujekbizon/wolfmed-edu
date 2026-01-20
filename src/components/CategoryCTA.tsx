import Link from 'next/link'

interface CategoryCTAProps {
  categoryName: string
}

export default function CategoryCTA({ categoryName }: CategoryCTAProps) {
  return (
    <div className='bg-white rounded-lg shadow-md p-8'>
      <h2 className='text-2xl font-bold mb-4'>Rozpocznij naukę</h2>
      <p className='text-gray-600 mb-6'>
        Gotowy do sprawdzenia swojej wiedzy? Rozpocznij egzamin z kategorii {categoryName}
      </p>
      <Link
        href='/panel/testy'
        className='inline-block bg-slate-700 text-white px-8 py-3 rounded-lg hover:bg-slate-800 transition-colors font-medium'
      >
        Rozpocznij Egzamin
      </Link>
    </div>
  )
}
