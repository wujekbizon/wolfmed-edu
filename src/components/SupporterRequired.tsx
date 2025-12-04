import Link from 'next/link'

export default function SupporterRequired() {
  return (
    <section className="w-full h-full flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div
          className="bg-linear-to-br from-[#ff9898]/10 to-rose-100/10 backdrop-blur-sm
          border border-[#ff9898]/30 p-8 rounded-2xl shadow-lg"
        >
          <div className="flex flex-col items-center gap-6 text-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-16 h-16 text-[#f58a8a]"
            >
              <path
                fillRule="evenodd"
                d="M12 1.5a5.25 5.25 0 0 0-5.25 5.25v3a3 3 0 0 0-3 3v6.75a3 3 0 0 0 3 3h10.5a3 3 0 0 0 3-3v-6.75a3 3 0 0 0-3-3v-3c0-2.9-2.35-5.25-5.25-5.25Zm3.75 8.25v-3a3.75 3.75 0 1 0-7.5 0v3h7.5Z"
              />
            </svg>

            <div>
              <h2 className="text-2xl font-bold text-zinc-900 mb-2">Funkcja dla wspierających</h2>
              <p className="text-zinc-700">
                Aby uzyskać dostęp do tej funkcji, musisz zostać wspierającym projektu.
              </p>
            </div>

            <Link
              href="/wsparcie-projektu"
              className="w-full px-6 py-3 bg-linear-to-r from-[#f58a8a] to-[#ffc5c5]
              text-zinc-900 font-semibold rounded-lg shadow-md
              hover:from-[#ff9898] hover:to-[#ffd5d5]
              transition-all duration-200 hover:scale-105 hover:shadow-lg"
            >
              Wesprzyj projekt
            </Link>

            <p className="text-sm text-zinc-600">
              Twoje wsparcie pomaga nam rozwijać platformę i dodawać nowe funkcje.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
