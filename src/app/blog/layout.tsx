export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="bg-gradient-to-b from-zinc-500 via-purple-100 to-zinc-300 justify-center rounded-br-3xl lg:rounded-br-[50px] rounded-bl-3xl lg:rounded-bl-[50px] p-2">
      {children}
    </main>
  )
}
