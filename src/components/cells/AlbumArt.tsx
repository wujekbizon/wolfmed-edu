import { Headphones } from 'lucide-react'

const GRADIENTS = [
  'from-rose-500 to-fuchsia-600',
  'from-violet-500 to-purple-700',
  'from-sky-500 to-blue-700',
  'from-emerald-500 to-teal-700',
  'from-amber-500 to-orange-600',
  'from-pink-500 to-rose-700',
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
