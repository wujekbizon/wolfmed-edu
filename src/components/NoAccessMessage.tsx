import Link from 'next/link'

export default function NoAccessMessage() {
  return (
    <section className='w-full h-full overflow-y-auto scrollbar-webkit p-4 lg:p-16'>
      <div className='max-w-4xl mx-auto'>
        <div className='bg-white rounded-lg shadow p-8'>
          <h2 className='text-2xl font-bold text-red-600 mb-4'>Brak dostępu</h2>
          <p className='text-gray-600 mb-6'>
            Nie masz dostępu do tego kursu. Kup kurs, aby uzyskać dostęp do testów z tej
            kategorii.
          </p>
          <Link
            href='/panel/kursy'
            className='inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors'
          >
            Wróć do moich kursów
          </Link>
        </div>
      </div>
    </section>
  )
}
