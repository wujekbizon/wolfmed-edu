import Link from 'next/link'

export default function CustomButton(props: {
  children?: React.ReactNode
  href: string
  text: string
  active?: boolean
}) {
  return (
    <Link
      href={props.href}
      className={`${
        props.active ? 'bg-white' : 'bg-[#ffc5c5]'
      } flex cursor-pointer place-items-center gap-5 stroke-neutral-400 stroke-[0.75] px-0.5 py-1 text-zinc-900 transition-all hover:scale-95 rounded-md border border-red-200/60 hover:shadow-sm hover:bg-[#f58a8a] shadow-md shadow-zinc-500 hover:border-zinc-900 hover:stroke-neutral-100 hover:text-white`}
    >
      {props.children}
      <p className="font-poppins overflow-x-hidden whitespace-nowrap text-lg tracking-wide text-inherit">
        {props.text}
      </p>
    </Link>
  )
}
