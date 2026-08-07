import Image from 'next/image'
import type { StoryScene } from '@/types/pathStoryTypes'

// Until real photography lands, the frame keeps the scene's rhythm with a
// hatched placeholder rather than collapsing the layout.
const HATCH =
  'repeating-linear-gradient(45deg, rgba(25,26,28,.05) 0 7px, transparent 7px 15px), linear-gradient(135deg, #E4F3EE, #EAE2F8)'

export default function StorySceneCard({
  scene,
  index,
  total,
}: {
  scene: StoryScene
  index: number
  total: number
}) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <span className="text-xs font-mono font-medium text-rose-500 tabular-nums">
          {scene.time}
        </span>
        <span className="h-px flex-1 bg-zinc-900/10" />
        <span className="text-[11px] uppercase tracking-widest text-zinc-400">
          Scena {index + 1}/{total}
        </span>
      </div>

      <div className="relative aspect-[16/10] max-h-[52vh] w-full overflow-hidden rounded-2xl ring-1 ring-zinc-900/5">
        {scene.imgSrc ? (
          <Image
            src={scene.imgSrc}
            alt={scene.title}
            fill
            sizes="(max-width: 1024px) 100vw, 60vw"
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0" style={{ backgroundImage: HATCH }} />
        )}
        <span className="absolute bottom-4 left-4 rounded-md bg-white/85 backdrop-blur-sm px-3 py-1.5 text-[11px] font-mono text-zinc-600 shadow-sm">
          [ foto: {scene.photoHint} ]
        </span>
      </div>

      <div>
        <h3 className="text-xl md:text-2xl font-bold text-slate-900 leading-snug">
          {scene.title}
        </h3>
        <p className="mt-2 text-zinc-600 text-sm md:text-base leading-relaxed text-pretty">
          {scene.description}
        </p>
      </div>
    </div>
  )
}
