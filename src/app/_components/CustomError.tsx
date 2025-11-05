'use client'

import Link from 'next/link'

const CustomError = ({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) => {
  return (
    <aside className="w-full h-[calc(100vh-80px)] flex flex-col items-center justify-center p-16">
      <h2 className="text-lg text-center text-[#ff4512af]">Ups, coś sie wydarzyło przepraszamy.</h2>
      <p>Jeśli problem się powtarza proszę o kontakt z naszym biurem obsługi.</p>
      <div className="flex items-center justify-center gap-6 mt-10">
        <button
          onClick={reset}
          className="px-4 py-2 bg-[#ff4512] text-white rounded hover:bg-[#871717] transition-colors"
        >
          Spróbuj ponownie
        </button>
        <Link className="hover:text-[#871717]" href="/#contact">
          Kontakt
        </Link>
      </div>
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-4 text-sm text-gray-500">
          <p>Error: {error.message}</p>
          {error.digest && <p>Digest: {error.digest}</p>}
        </div>
      )}
    </aside>
  )
}

export default CustomError
