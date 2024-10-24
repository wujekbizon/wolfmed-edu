export default function TermsHeader({ title }: { title: string }) {
  return (
    <div className="flex items-center justify-center h-64 bg-zinc-100">
      <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold pt-12 text-center px-4">{title}</h1>
    </div>
  )
}
