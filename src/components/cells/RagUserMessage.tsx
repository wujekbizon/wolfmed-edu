export default function RagUserMessage({ text }: { text: string }) {
  return (
    <div className="flex justify-end">
      <div className="max-w-[92%] sm:max-w-[85%] xl:max-w-3xl bg-zinc-800 text-white rounded-2xl rounded-tr-sm px-3 py-2 sm:px-4 sm:py-3 shadow-sm">
        <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">{text}</p>
      </div>
    </div>
  )
}
