import Image from 'next/image'

export default function BrandSignature() {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-zinc-400 bg-zinc-200">
        <Image
          src="https://utfs.io/a/zw3dk8dyy9/UVAwLrIxs2k5UOm8ArIxs2k5EyuGdN4SRigYP6qreJDvtVZl"
          alt="Wolfmed Edukacja logo"
          width={50}
          height={50}
          className="h-full w-full rounded-full object-cover"
          priority
        />
      </div>
      <div>
        <p className="text-2xl font-bold leading-tight text-zinc-800">
          WOLFMED <span className="font-normal text-zinc-500">EDUKACJA</span>
        </p>
        <p className="text-sm text-zinc-500">
          Innowacyjne rozwiązania w edukacji medycznej
        </p>
      </div>
    </div>
  )
}
