import Link from 'next/link'

interface TierUpgradeMessageProps {
  requiredTier: string
  userTier: string
}

export default function TierUpgradeMessage({
  requiredTier,
  userTier,
}: TierUpgradeMessageProps) {
  return (
    <section className='w-full h-full overflow-y-auto scrollbar-webkit p-4 lg:p-16'>
      <div className='max-w-4xl mx-auto'>
        <div className='bg-white rounded-lg shadow p-8'>
          <h2 className='text-2xl font-bold text-orange-600 mb-4'>
            🔒 Wymagana wyższa wersja
          </h2>
          <p className='text-gray-600 mb-4'>
            Ta kategoria wymaga pakietu{' '}
            <span className='font-semibold'>{requiredTier}</span>.
          </p>
          <p className='text-gray-600 mb-6'>
            Twój aktualny pakiet: <span className='font-semibold'>{userTier}</span>
          </p>
          <div className='flex gap-4'>
            <Link
              href='/panel/kursy'
              className='inline-block bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors'
            >
              Wróć do moich kursów
            </Link>
            <Link
              href='#'
              className='inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors'
            >
              Ulepsz pakiet
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
