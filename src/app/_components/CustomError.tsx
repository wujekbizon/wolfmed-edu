import Link from 'next/link'

const CustomError = ({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) => {
  return (
    <aside className="w-full h-[calc(100vh_-_70px)] flex flex-col items-center justify-center p-16">
      <h2 className="text-lg text-center text-[#ff4512af]">There was a problem</h2>
      <h1 className="text-3xl font-bold text-center">{error.message}</h1>
      <p>Please try again later or contact support if the problem persists.</p>
      <div className="flex items-center justify-center gap-6 mt-10">
        <button className="h-10 w-36 text-white bg-black rounded" onClick={reset}>
          Try again
        </button>
        <Link className="hover:text-[#871717]" href="/">
          Go back
        </Link>
      </div>
    </aside>
  )
}
export default CustomError
