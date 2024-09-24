import Link from 'next/link'

const CustomError = ({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) => {
  return (
    <aside className="w-full h-[calc(100vh_-_70px)] flex flex-col items-center justify-center p-16">
      <h2 className="text-lg text-center text-[#ff4512af]">Ups, coś sie wydarzyło przepraszamy.</h2>
      <p>Jeśli problem się powtarza proszę o kontakt z naszym biurem obsługi.</p>
      <div className="flex items-center justify-center gap-6 mt-10">
        <Link className="hover:text-[#871717]" href="/#contact">
          Go back
        </Link>
      </div>
    </aside>
  )
}
export default CustomError
