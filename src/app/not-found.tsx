import Link from 'next/link'
import Image from 'next/image'

export const dynamic = 'force-static'

export default function NotFound() {
  return (
    <div className="relative flex h-[calc(100vh_-_70px)] rounded-br-3xl lg:rounded-br-[50px] rounded-bl-3xl lg:rounded-bl-[50px] flex-col items-center justify-end">
      <Image
        src="https://utfs.io/a/zw3dk8dyy9/UVAwLrIxs2k5WKS1n8uB5MlwXOa6c4ysqzvIDSAEFVTYor7Q"
        alt="404 background"
        fill
        priority
        className="object-cover rounded-bl-3xl rounded-br-3xl lg:rounded-bl-[50px] lg:rounded-br-[50px]"
        sizes="100vw"
      />
      <Link
        href="/"
        className="relative z-10 flex justify-center mb-10 bg-[#ffc5c5] items-center text-2xl w-64 h-10 transition-all hover:scale-95 rounded-md border border-red-100/50 hover:border-zinc-900 hover:shadow-sm hover:bg-[#f58a8a] shadow-md shadow-zinc-500"
      >
        Powrót
      </Link>
    </div>
  )
}
