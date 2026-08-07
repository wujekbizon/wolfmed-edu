import Image from 'next/image'
import type { StoryScene } from '@/types/pathStoryTypes'

// Until real photography lands, the frame keeps the scene's rhythm with a
// hatched placeholder rather than collapsing the layout.
const HATCH =
  'repeating-linear-gradient(135deg, rgba(244,63,94,0.06) 0px, rgba(244,63,94,0.06) 8px, rgba(255,255,255,0.5) 8px, rgba(255,255,255,0.5) 16px)'

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
    <article className="flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <span className="text-xs font-mono font-medium text-rose-500 tabular-nums">
          {scene.time}
        </span>
        <span className="h-px flex-1 bg-zinc-900/10" />
        <span className="text-[11px] uppercase tracking-widest text-zinc-400">
          Scena {index + 1}/{total}
        </span>
      </div>

      <div className="relative aspect-[16/10] max-h-[42vh] w-full overflow-hidden rounded-2xl ring-1 ring-zinc-900/5">
        {scene.imgSrc ? (
          <Image
            src={scene.imgSrc}
            alt={scene.title}
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
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
        <p className="mt-2 text-zinc-600 text-sm md:text-base leading-relaxed">
          {scene.description}
        </p>
      </div>
    </article>
  )
}
