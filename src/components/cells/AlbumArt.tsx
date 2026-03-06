import { Headphones } from 'lucide-react'

const GRADIENTS = [
  'from-rose-500 to-fuchsia-600',
  'from-zinc-500 to-zinc-700',
  'from-fuchsia-500 to-purple-700',
  'from-zinc-400 to-rose-600',
  'from-rose-400 to-zinc-600',
  'from-zinc-600 to-fuchsia-500',
]

function pickGradient(seed: string): string {
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0
  }
  return GRADIENTS[hash % GRADIENTS.length] ?? 'from-rose-500 to-fuchsia-600'
}

export default function AlbumArt({ title }: { title: string }) {
  const gradient = pickGradient(title)
  return (
    <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shrink-0 shadow-lg`}>
      <Headphones className="w-7 h-7 text-white/80" />
    </div>
  )
}
